(define-map compositions {parent: principal, child: principal} {relationship: (string-ascii 32), created-at: uint})
(define-map composition-graph principal (list 10 principal))
(define-map composition-metadata {parent: principal, child: principal} {data: (buff 64)})

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-COMPOSITION-EXISTS (err u101))

(define-public (create-composition (child principal) (relationship (string-ascii 32)))
  (let ((parent tx-sender))
    (asserts! (is-none (map-get? compositions {parent: parent, child: child})) ERR-COMPOSITION-EXISTS)
    (map-set compositions {parent: parent, child: child} {relationship: relationship, created-at: stacks-block-height})
    (let ((children (default-to (list) (map-get? composition-graph parent))))
      (ok (map-set composition-graph parent (unwrap-panic (as-max-len? (append children child) u10)))))))

(define-public (remove-composition (child principal))
  (let ((parent tx-sender))
    (map-delete compositions {parent: parent, child: child})
    (ok true)))

(define-public (set-metadata (child principal) (data (buff 64)))
  (let ((parent tx-sender))
    (ok (map-set composition-metadata {parent: parent, child: child} {data: data}))))

(define-read-only (get-composition (parent principal) (child principal))
  (map-get? compositions {parent: parent, child: child}))

(define-read-only (get-children (parent principal))
  (map-get? composition-graph parent))

(define-read-only (get-metadata (parent principal) (child principal))
  (map-get? composition-metadata {parent: parent, child: child}))
