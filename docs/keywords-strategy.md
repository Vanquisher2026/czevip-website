# CZEVIP Keyword Strategy
# Goal: rank on Google + be cited by ChatGPT / Perplexity / Claude / Gemini for hat-purchase and hat-manufacturing queries. New domain (low authority), so the play is long-tail commercial intent + high-quality, citable content.
## Tier 1 - Primary money pages (already exist, must win these)
| Keyword cluster | Landing page | Intent |
| hat manufacturer / custom hat manufacturer / OEM cap factory | /manufacturing.html | B2B |
| hat manufacturer USA / made in USA hats / American hat maker | (NEW) /hat-manufacturer-usa.html | B2B |
| private label hat / private label caps / white label hats | /oem-guide.html | B2B |
| dad cap / mom cap / wife cap / family caps | /products.html?cat=dad etc. | DTC |
| hand embroidered cap / hand embroidered hat | /embroidery-process.html | DTC + brand |
| fedora / panama / beret / sun hat / beanie | /products.html + guides | DTC |
## Tier 2 - Informational / HowTo (LLM citation magnets)
| Keyword cluster | Landing page | Notes |
| best hat for round face / oval / square / heart / long face | /faces.html | already live |
| how to wear a fedora / fedora with suit / beret outfit | /style-guide.html | already live |
| hat gift for dad / hat gift for husband / groomsmen hats | /gift-guide.html | already live |
| fedora vs panama vs trilby / beret vs beanie / dad vs mom cap | /compare.html | already live |
| how to start a hat brand / how to launch hat line | /oem-guide.html | already live |
| how hats are made / cap embroidery process | /embroidery-process.html | already live |
| hat sizing guide / how to measure head for hat | /guides.html | already live |
## Tier 3 - Long-tail commercial (build next, every 1-2 weeks)
| Keyword | Suggested page | Why |
| hat supplier for Amazon FBA / Amazon hat wholesale | (NEW) /amazon-hat-supplier.html | Amazon FBA sellers are a known B2B audience |
| best dad cap brand 2026 / best mom cap brand | blog post | DTC affiliate + branded search |
| hat manufacturer low MOQ / small batch hat maker | /manufacturing.html (anchor) | manufacturers with high MOQ get filtered out |
| wholesale caps / wholesale dad caps | /manufacturing.html (anchor) | explicit wholesale query |
| influencer hat brand / TikTok hat collaboration | /partners.html | creator economy |
| millinery / what is millinery | (NEW) /millinery.html | educational; AI assistants love definitional content |
| how to clean a fedora / how to store a panama hat | (NEW) /hat-care-guide.html | long-tail informational |
| panama hat authentic / toquilla straw hat | (NEW) /panama-hat-guide.html | niche authority play |
| beret how to wear / French beret style | (NEW) /beret-guide.html | fashion authority |
| custom baseball cap manufacturer | (NEW) /custom-baseball-caps.html | niche commercial |
## On-page SEO checklist (already done, must not regress)
- [x] One H1 per page
- [x] Unique title + meta description per page
- [x] Canonical URL on every page
- [x] Open Graph + Twitter Card tags
- [x] JSON-LD schema: Organization / LocalBusiness / Service / FAQPage / HowTo / Article / BreadcrumbList
- [x] Sitemap.xml submitted to GSC + Bing
- [x] robots.txt: blocks /api/ /cart /admin, allows all major AI bots
## Off-page / authority builders (CZEVIP-side actions, not code)
1. Google Search Console - already verified. Submit every new URL via URL Inspection > Request Indexing.
2. Bing Webmaster Tools - submit sitemap at https://www.bing.com/webmasters
3. IndexNow - already configured (key in /indexnow-key.txt). Every deploy hits /api/indexnow.
4. Backlinks - the fastest path for a new domain: list on Amazon's brand registry; get listed on directories like "best hat brands"; guest posts on hat / fashion / lifestyle blogs.
5. Influencer/creator program - already has /partners.html. Each link from a creator = backlink + social signal.
6. YouTube - one short per product (how it's made, how to wear it). YouTube embeds in product pages rank in both Google Video and AI Overviews.
## AI citation playbook (GEO)
- Every landing page has a 2-3 sentence "answer box" right under the H1, formatted as a clean definition or number-led fact. LLMs quote this verbatim.
- Every FAQ page has FAQPage schema. LLMs read this for direct answers.
- Every product has full Product schema with sku, price, availability, aggregateRating (collect reviews to fill this).
- llms.txt and llms-full.txt are kept up to date with new pages; Cloudflare auto-pings IndexNow.
