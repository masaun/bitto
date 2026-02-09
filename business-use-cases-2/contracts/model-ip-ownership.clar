(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map ip-ownership uint {model-id: uint, owner: principal, license: (string-ascii 64), transferable: bool})
(define-data-var ip-nonce uint u0)

(define-public (register-ip (model-id uint) (license (string-ascii 64)) (transferable bool))
  (let ((ip-id (+ (var-get ip-nonce) u1)))
    (map-set ip-ownership ip-id {model-id: model-id, owner: tx-sender, license: license, transferable: transferable})
    (var-set ip-nonce ip-id)
    (ok ip-id)))

(define-public (transfer-ip (ip-id uint) (new-owner principal))
  (let ((ip (unwrap! (map-get? ip-ownership ip-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get owner ip) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (get transferable ip) ERR-INVALID-PARAMETER)
    (ok (map-set ip-ownership ip-id (merge ip {owner: new-owner})))))

(define-read-only (get-ip (ip-id uint))
  (ok (map-get? ip-ownership ip-id)))
