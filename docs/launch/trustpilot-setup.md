# Trustpilot Setup - Ready to Execute
# Total time: ~30 minutes
# Free tier is enough until ~10k invites/month

# ============================================================
# STEP 1 - REGISTER BUSINESS PROFILE (5 min)
# ============================================================
# URL: https://www.trustpilot.com/evaluate-b2b/czevip.com
#
# Fields:
# - Business URL: https://www.czevip.com
# - Business name: CZEVIP
# - Country: United States
# - Category: Apparel & Fashion > Headwear
# - Business email: info@czevip.com
# - Your name: [your real name]
# - Your role: Owner / Founder

# ============================================================
# STEP 2 - DOMAIN VERIFICATION (2 min)
# ============================================================
# After registering, Trustpilot gives you ONE of these:
# Option A - a TXT record token (looks like: "trustpilot-domain-verification=...")
# Option B - an HTML file you upload to your root
#
# PICK OPTION A (TXT record). Reasons:
#   - Lives in Cloudflare DNS, survives every site redeploy
#   - One change, zero ongoing maintenance
#   - HTML file approach means re-uploading every time you redeploy
#
# In Cloudflare Dashboard:
#   DNS > Records > Add record
#     Type: TXT
#     Name: @
#     Content: [paste the token Trustpilot gave you]
#     TTL: Auto
#   Click Save
#
# Then back in Trustpilot portal: "Verify" button
# DNS propagates in 5-15 min.

# ============================================================
# STEP 3 - BUSINESS PORTAL CONFIG (10 min)
# ============================================================
# In Trustpilot Business Portal (after verification):
#   - Branded review page: ENABLE (czevip.trustpilot.com auto-redirects to your page)
#   - Logo: upload /assets/logo.svg
#   - Description: "Hand-embroidered caps and B2B hat manufacturing from Brooklyn, NY. Family caps and OEM / private label for global brands."
#   - Categories: enable both "Apparel & Fashion > Headwear" and "Manufacturing"
#   - Review collection: enable "Review invitations"
#   - Service Reviews: DISABLE for now (you don't have a SaaS)
#   - Location Reviews: DISABLE
#
# Note your Business Unit ID - you'll need it for the widget later.
# (Settings > API > Business Unit ID)

# ============================================================
# STEP 4 - INVITE EMAIL TEMPLATE (paste into Trustpilot)
# ============================================================
# Trustpilot > Invitation settings > Customize

# Subject line:
How was your CZEVIP hat?

# Email body (plain text version):
Hi {customerName},

Thank you for ordering from CZEVIP. We hope your new cap is treating you well.

If you have a moment, would you mind sharing your experience? Every review - honest, critical, or glowing - helps us improve and helps other customers choose with confidence.

Leave your review here: {reviewLink}

It takes about 90 seconds. Thank you.

- The CZEVIP team

# Send timing:
#   Days after order delivery: 7
#   Cutoff after no review: 90 days
#
# Why 7 days: customers have worn the hat twice, washed it once, and formed a real opinion

# ============================================================
# STEP 5 - RESPONSE TEMPLATES (paste into each star bucket)
# ============================================================

# 5-star reply
Thank you, [first name]. We're glad the cap is hitting the mark - and thanks for taking the time to share. - Team CZEVIP

# 4-star reply
Thank you, [first name]. We appreciate the honest feedback. If anything's not quite right, email info@czevip.com and we'll make it right. - Team CZEVIP

# 3-star reply
Thank you, [first name]. We'd love to understand what would have made it a 5. Email info@czevip.com anytime. - Team CZEVIP

# 2-star reply
[First name], thank you for the honest feedback. This isn't the standard we want. Please email info@czevip.com so we can resolve directly. - Team CZEVIP

# 1-star reply
[First name], we're sorry. This shouldn't have happened. Please email info@czevip.com - we'll make it right immediately. - Team CZEVIP

# ============================================================
# STEP 6 - TRUSTBOX WIDGET ON PRODUCT PAGE (after setup)
# ============================================================
# Once you have your Business Unit ID and Template ID from Trustpilot portal,
# paste this in product.html just below [data-product-price]:
#
# <div class="trustpilot-widget"
#      data-locale="en-US"
#      data-template-id="REPLACE_WITH_TEMPLATE_ID"
#      data-businessunit-id="REPLACE_WITH_BUSINESS_UNIT_ID"
#      data-style-height="24px"
#      data-style-width="100%"
#      data-theme="light">
#   <a href="https://www.trustpilot.com/review/czevip.com" target="_blank" rel="noopener">Trustpilot</a>
# </div>
# <script type="text/javascript" src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" async></script>
#
# After the first 10 reviews come in, swap to data-template-id="5406e89cde647fd90XXXXXX" (the star-rating variant)

# ============================================================
# EXPECTED TIMELINE
# ============================================================
# Day 1: register + verify
# Day 7: first invites go out (after first 5 orders ship)
# Day 30: 3-5 reviews in
# Day 60: 10-15 reviews
# Day 75: Google starts showing stars in search results (requires 10+ reviews)
# Day 90: 20-30 reviews, ranking signal compounds

# ============================================================
# WHAT NOT TO DO
# ============================================================
# - Don't buy fake reviews (Trustpilot detects and removes)
# - Don't offer discounts for reviews (against FTC + Trustpilot ToS)
# - Don't cherry-pick only happy customers to invite (algorithm flags)
# - Don't ignore negative reviews publicly - always respond within 24h
# - Don't ask friends and family to post reviews in the first 30 days