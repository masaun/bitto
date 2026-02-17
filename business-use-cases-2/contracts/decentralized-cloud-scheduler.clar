(define-constant contract-owner tx-sender)

(define-map compute-jobs uint {requester: principal, resource-type: (string-ascii 32), status: (string-ascii 20), created-at: uint})
(define-data-var job-nonce uint u0)

(define-public (schedule-job (resource-type (string-ascii 32)))
  (let ((id (var-get job-nonce)))
    (map-set compute-jobs id {requester: tx-sender, resource-type: resource-type, status: "pending", created-at: stacks-block-height})
    (var-set job-nonce (+ id u1))
    (ok id)))

(define-public (update-job-status (job-id uint) (status (string-ascii 20)))
  (let ((job (unwrap! (map-get? compute-jobs job-id) (err u101))))
    (ok (map-set compute-jobs job-id (merge job {status: status})))))

(define-read-only (get-job (job-id uint))
  (ok (map-get? compute-jobs job-id)))
