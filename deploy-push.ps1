# Run this script from D:\web\CZEVIP to push the repo to GitHub.
# Before running: create a Personal Access Token at
#   https://github.com/settings/tokens/new
# with scope `repo` (full repo access). Paste it below when prompted.

$token = Read-Host "Paste your GitHub Personal Access Token (hidden)"
if (-not $token) { Write-Host "No token provided, aborting." -ForegroundColor Red; exit 1 }

# Replace origin URL with token-authenticated version (HTTPS).
$remote = "https://x-access-token:$token@github.com/Vanquisher2026/czevip-website.git"
git remote remove origin 2>$null
git remote add origin $remote

# Set git author for this commit (overrides global config).
$env:GIT_AUTHOR_NAME = "CZEVIP Deploy"
$env:GIT_AUTHOR_EMAIL = "deploy@czevip.local"
$env:GIT_COMMITTER_NAME = "CZEVIP Deploy"
$env:GIT_COMMITTER_EMAIL = "deploy@czevip.local"

git push -u origin main 2>&1

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "Push complete. Now go to:" -ForegroundColor Green
  Write-Host "  https://dash.cloudflare.com/ -> Workers & Pages -> Create -> Pages -> Connect to Git"
  Write-Host "  Pick repo Vanquisher2026/czevip-website, branch main, output directory '.'"
}
