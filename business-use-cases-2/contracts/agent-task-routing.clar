(define-map routes {route-id: uint} {source: principal, destination: principal, task-type: (string-ascii 32), active: bool})
(define-map routing-rules principal (list 10 uint))
(define-data-var route-counter uint u0)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ROUTE-NOT-FOUND (err u102))

(define-public (create-route (destination principal) (task-type (string-ascii 32)))
  (let ((route-id (var-get route-counter))
        (rules (default-to (list) (map-get? routing-rules tx-sender))))
    (map-set routes {route-id: route-id} {source: tx-sender, destination: destination, task-type: task-type, active: true})
    (map-set routing-rules tx-sender (unwrap-panic (as-max-len? (append rules route-id) u10)))
    (var-set route-counter (+ route-id u1))
    (ok route-id)))

(define-public (toggle-route (route-id uint) (active bool))
  (let ((route (unwrap! (map-get? routes {route-id: route-id}) ERR-ROUTE-NOT-FOUND)))
    (asserts! (is-eq (get source route) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set routes {route-id: route-id} (merge route {active: active})))))

(define-read-only (get-route (route-id uint))
  (map-get? routes {route-id: route-id}))

(define-read-only (get-routes (source principal))
  (map-get? routing-rules source))
