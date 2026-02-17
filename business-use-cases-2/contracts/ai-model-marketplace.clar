(define-constant contract-owner tx-sender)

(define-map ai-models uint {provider: principal, model-type: (string-ascii 32), price: uint, active: bool})
(define-map model-purchases uint {model-id: uint, buyer: principal, purchased-at: uint})
(define-data-var model-nonce uint u0)
(define-data-var purchase-nonce uint u0)

(define-public (list-model (model-type (string-ascii 32)) (price uint))
  (let ((id (var-get model-nonce)))
    (map-set ai-models id {provider: tx-sender, model-type: model-type, price: price, active: true})
    (var-set model-nonce (+ id u1))
    (ok id)))

(define-public (purchase-model (model-id uint))
  (let ((purchase-id (var-get purchase-nonce)))
    (map-set model-purchases purchase-id {model-id: model-id, buyer: tx-sender, purchased-at: stacks-block-height})
    (var-set purchase-nonce (+ purchase-id u1))
    (ok purchase-id)))

(define-read-only (get-model (model-id uint))
  (ok (map-get? ai-models model-id)))
