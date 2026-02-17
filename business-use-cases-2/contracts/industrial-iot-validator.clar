(define-constant contract-owner tx-sender)

(define-map industrial-devices (string-ascii 64) {owner: principal, device-type: (string-ascii 32), validated: bool, validated-at: uint})

(define-public (register-device (device-id (string-ascii 64)) (device-type (string-ascii 32)))
  (ok (map-set industrial-devices device-id {owner: tx-sender, device-type: device-type, validated: false, validated-at: u0})))

(define-public (validate-device (device-id (string-ascii 64)))
  (let ((device (unwrap! (map-get? industrial-devices device-id) (err u101))))
    (ok (map-set industrial-devices device-id (merge device {validated: true, validated-at: stacks-block-height})))))

(define-read-only (get-device (device-id (string-ascii 64)))
  (ok (map-get? industrial-devices device-id)))
