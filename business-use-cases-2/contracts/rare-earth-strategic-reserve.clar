(define-map reserves (string-ascii 50) {
  quantity: uint,
  location: (string-ascii 100),
  last-updated: uint
})

(define-data-var reserve-admin principal tx-sender)

(define-read-only (get-reserve (material-type (string-ascii 50)))
  (map-get? reserves material-type))

(define-public (add-to-reserve (material-type (string-ascii 50)) (quantity uint) (location (string-ascii 100)))
  (begin
    (asserts! (is-eq tx-sender (var-get reserve-admin)) (err u1))
    (match (map-get? reserves material-type)
      existing (ok (map-set reserves material-type {
        quantity: (+ (get quantity existing) quantity),
        location: location,
        last-updated: stacks-block-height
      }))
      (ok (map-set reserves material-type {
        quantity: quantity,
        location: location,
        last-updated: stacks-block-height
      })))))

(define-public (release-from-reserve (material-type (string-ascii 50)) (quantity uint))
  (begin
    (asserts! (is-eq tx-sender (var-get reserve-admin)) (err u1))
    (match (map-get? reserves material-type)
      existing (begin
        (asserts! (>= (get quantity existing) quantity) (err u2))
        (ok (map-set reserves material-type (merge existing { 
          quantity: (- (get quantity existing) quantity),
          last-updated: stacks-block-height
        }))))
      (err u3))))
