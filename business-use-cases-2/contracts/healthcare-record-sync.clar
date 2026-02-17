(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-unauthorized (err u101))

(define-map health-records principal {record-hash: (buff 32), last-updated: uint})
(define-map access-permissions {patient: principal, provider: principal} bool)

(define-public (update-record (record-hash (buff 32)))
  (ok (map-set health-records tx-sender {record-hash: record-hash, last-updated: stacks-block-height})))

(define-public (grant-access (provider principal))
  (ok (map-set access-permissions {patient: tx-sender, provider: provider} true)))

(define-public (revoke-access (provider principal))
  (ok (map-set access-permissions {patient: tx-sender, provider: provider} false)))

(define-read-only (get-record (patient principal))
  (ok (map-get? health-records patient)))

(define-read-only (has-access (patient principal) (provider principal))
  (ok (default-to false (map-get? access-permissions {patient: patient, provider: provider}))))
