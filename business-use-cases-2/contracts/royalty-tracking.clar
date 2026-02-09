(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map royalties {asset-id: uint, recipient: principal} {percentage: uint, total-paid: uint})

(define-public (set-royalty (asset-id uint) (recipient principal) (percentage uint))
  (begin
    (asserts! (<= percentage u100) ERR-INVALID-PARAMETER)
    (ok (map-set royalties {asset-id: asset-id, recipient: recipient} {percentage: percentage, total-paid: u0}))))

(define-read-only (get-royalty (asset-id uint) (recipient principal))
  (ok (map-get? royalties {asset-id: asset-id, recipient: recipient})))
