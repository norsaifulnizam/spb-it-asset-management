# Intelligence Layer

## Messy Inputs (later)
- Free-text asset description → auto-extract type/brand/model.
- Pasted spreadsheet row → parse into structured asset record.

## Auto-Structure Schema (later)
```json
{
  "asset_type": "laptop",
  "brand": "Dell",
  "model": "Latitude 5440",
  "serial": "DL5440SN001",
  "confidence": 0.92,
  "source": "openai-gpt-4o-mini",
  "review_status": "unreviewed"
}
```

## Events to Track (v1, rule-based)
- Asset registered
- Asset assigned to employee
- Asset returned / unassigned
- Asset sent for repair
- Warranty expiry crossed

## Scoring Rules (v1, rule-based)
- **Attention score** per asset: +30 if `status=under_repair`, +20 if `condition=poor/defective`, +20 if warranty expired, +10 if assigned > 2 years.
- Dashboard ranks assets by attention score descending — "Needs attention" list.

## What Gets Ranked
Assets needing follow-up: expired warranty, under repair, poor condition, long-assigned.

## v1 vs Later
- **v1:** Rule-based attention scoring + status flags.
- **Later:** AI auto-categorisation, natural-language asset search, predictive maintenance suggestions.