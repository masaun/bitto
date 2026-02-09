(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map fine-tuning-jobs uint {model-id: uint, owner: principal, epochs: uint, status: (string-ascii 20)})
(define-data-var job-nonce uint u0)

(define-public (start-fine-tuning (model-id uint) (epochs uint))
  (let ((job-id (+ (var-get job-nonce) u1)))
    (asserts! (> epochs u0) ERR-INVALID-PARAMETER)
    (map-set fine-tuning-jobs job-id {model-id: model-id, owner: tx-sender, epochs: epochs, status: "running"})
    (var-set job-nonce job-id)
    (ok job-id)))

(define-public (complete-job (job-id uint))
  (let ((job (unwrap! (map-get? fine-tuning-jobs job-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get owner job) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set fine-tuning-jobs job-id (merge job {status: "completed"})))))

(define-read-only (get-job (job-id uint))
  (ok (map-get? fine-tuning-jobs job-id)))
