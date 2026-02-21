(define-constant contract-owner tx-sender)

(define-map grid-nodes (string-ascii 64) {operator: principal, capacity: uint, current-load: uint, status: (string-ascii 20)})

(define-public (register-node (node-id (string-ascii 64)) (capacity uint))
  (ok (map-set grid-nodes node-id {operator: tx-sender, capacity: capacity, current-load: u0, status: "active"})))

(define-public (update-load (node-id (string-ascii 64)) (load uint))
  (let ((node (unwrap! (map-get? grid-nodes node-id) (err u101))))
    (ok (map-set grid-nodes node-id (merge node {current-load: load})))))

(define-read-only (get-node (node-id (string-ascii 64)))
  (ok (map-get? grid-nodes node-id)))
