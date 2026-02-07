(define-map defense-supplies uint {
  supplier: principal,
  defense-contractor: principal,
  material-type: (string-ascii 50),
  quantity: uint,
  clearance-level: (string-ascii 20),
  supply-date: uint,
  status: (string-ascii 20)
})

(define-data-var supply-counter uint u0)
(define-data-var defense-authority principal tx-sender)

(define-read-only (get-defense-supply (supply-id uint))
  (map-get? defense-supplies supply-id))

(define-public (authorize-defense-supply (supplier principal) (defense-contractor principal) (material-type (string-ascii 50)) (quantity uint) (clearance-level (string-ascii 20)))
  (let ((new-id (+ (var-get supply-counter) u1)))
    (asserts! (is-eq tx-sender (var-get defense-authority)) (err u1))
    (map-set defense-supplies new-id {
      supplier: supplier,
      defense-contractor: defense-contractor,
      material-type: material-type,
      quantity: quantity,
      clearance-level: clearance-level,
      supply-date: stacks-block-height,
      status: "authorized"
    })
    (var-set supply-counter new-id)
    (ok new-id)))
