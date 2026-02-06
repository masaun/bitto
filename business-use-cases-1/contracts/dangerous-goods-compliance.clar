(define-map dangerous-goods
  { compliance-id: uint }
  {
    shipment-id: uint,
    un-number: (string-ascii 20),
    class: (string-ascii 20),
    packing-group: (string-ascii 10),
    compliant: bool,
    verified-at: uint
  }
)

(define-data-var compliance-nonce uint u0)

(define-public (verify-dangerous-goods (shipment uint) (un-number (string-ascii 20)) (class (string-ascii 20)) (packing-group (string-ascii 10)) (compliant bool))
  (let ((compliance-id (+ (var-get compliance-nonce) u1)))
    (map-set dangerous-goods
      { compliance-id: compliance-id }
      {
        shipment-id: shipment,
        un-number: un-number,
        class: class,
        packing-group: packing-group,
        compliant: compliant,
        verified-at: stacks-block-height
      }
    )
    (var-set compliance-nonce compliance-id)
    (ok compliance-id)
  )
)

(define-read-only (get-compliance (compliance-id uint))
  (map-get? dangerous-goods { compliance-id: compliance-id })
)
