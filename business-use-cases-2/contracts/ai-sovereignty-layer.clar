(define-map records {id: uint} {owner: principal, data: (buff 64), created-at: uint})
(define-data-var counter uint u0)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-NOT-FOUND (err u102))

(define-public (create-record (data (buff 64)))
  (let ((id (var-get counter)))
    (map-set records {id: id} {owner: tx-sender, data: data, created-at: stacks-block-height})
    (var-set counter (+ id u1))
    (ok id)))

(define-public (update-record (id uint) (data (buff 64)))
  (let ((record (unwrap! (map-get? records {id: id}) ERR-NOT-FOUND)))
    (asserts! (is-eq (get owner record) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set records {id: id} (merge record {data: data})))))

(define-read-only (get-record (id uint))
  (map-get? records {id: id}))
