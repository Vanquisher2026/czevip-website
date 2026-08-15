# Push the local CZEVIP repo to GitHub using only the REST API.
# Works when github.com HTTPS / SSH are blocked but api.github.com is reachable.
param([Parameter(Mandatory=$true)][string]$Token)

$ErrorActionPreference = 'Stop'
$Owner = 'Vanquisher2026'
$Repo  = 'czevip-website'
$Branch = 'main'
$Headers = @{
  Authorization  = "Bearer $Token"
  'User-Agent'   = 'czevip-deploy'
  Accept         = 'application/vnd.github+json'
  'X-GitHub-Api-Version' = '2022-11-28'
}
$Base = "https://api.github.com/repos/$Owner/$Repo"

function Api($method, $path, $body = $null) {
  $uri = "$Base$path"
  $params = @{
    Uri         = $uri
    Method      = $method
    Headers     = $Headers
    ContentType = 'application/json'
  }
  if ($null -ne $body) { $params.Body = ($body | ConvertTo-Json -Depth 20) }
  return Invoke-RestMethod @params
}

Write-Host "[1/5] Reading local tree..." -ForegroundColor Cyan
$files = git ls-files | ForEach-Object {
  $path = $_.Replace('\','/')
  $full = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $path).Path)
  [PSCustomObject]@{ path = $path; bytes = $full; size = $full.Length }
}
Write-Host ("  {0} files, {1:N0} bytes" -f $files.Count, ($files | Measure-Object -Property size -Sum).Sum)

Write-Host "[2/5] Resolving remote HEAD..." -ForegroundColor Cyan
try {
  $ref = Api GET "/git/ref/heads/$Branch"
  $parentSha = $ref.object.sha
  $baseTree = (Api GET "/git/commits/$parentSha").tree.sha
  Write-Host "  parent=$parentSha  tree=$baseTree"
} catch {
  $parentSha = $null
  $baseTree  = $null
  Write-Host "  empty repo, no parent"
}

Write-Host "[3/5] Creating blobs..." -ForegroundColor Cyan
$blobs = @()
$i = 0
foreach ($f in $files) {
  $i++
  $b64 = [Convert]::ToBase64String($f.bytes)
  $body = @{ content = $b64; encoding = 'base64' }
  $resp = Api POST '/git/blobs' $body
  $blobs += [PSCustomObject]@{ path = $f.path; sha = $resp.sha }
  if ($i % 10 -eq 0 -or $i -eq $files.Count) {
    Write-Host ("  {0}/{1} blobs" -f $i, $files.Count)
  }
}

Write-Host "[4/5] Creating tree..." -ForegroundColor Cyan
$treeEntries = @()
foreach ($b in $blobs) {
  $treeEntries += @{ path = $b.path; mode = '100644'; type = 'blob'; sha = $b.sha }
}
$treeBody = @{ tree = $treeEntries; base_tree = $baseTree }
$tree = Api POST '/git/trees' $treeBody
Write-Host ("  tree={0}  entries={1}" -f $tree.sha, $tree.truncated)

Write-Host "[5/5] Creating commit + updating ref..." -ForegroundColor Cyan
$parentsArr = @()
if ($parentSha) { $parentsArr = @($parentSha) }
$author = @{
  name  = 'CZEVIP Deploy'
  email = 'deploy@czevip.local'
  date  = (Get-Date).ToUniversalTime().ToString('o')
}
$commit = Api POST '/git/commits' @{
  message = 'Initial CZEVIP deploy - public site + admin + GMC feed'
  tree    = $tree.sha
  parents = $parentsArr
  author  = $author
}
Write-Host ("  commit={0}" -f $commit.sha)

Api PATCH "/git/refs/heads/$Branch" @{
  sha   = $commit.sha
  force = $true
} | Out-Null
Write-Host ("  ref updated -> {0}" -f $Branch) -ForegroundColor Green

Write-Host ""
Write-Host ("Done. View at https://github.com/{0}/{1}" -f $Owner, $Repo) -ForegroundColor Green
