(define-constant contract-owner tx-sender)

(define-map assets (string-ascii 64) {owner: principal, asset-type: (string-ascii 32), status: (string-ascii 20)})
(define-map maintenance-records uint {asset-id: (string-ascii 64), maintenance-type: (string-ascii 32), prediction-score: uint, timestamp: uint})
(define-data-var record-nonce uint u0)

(define-public (register-asset (asset-id (string-ascii 64)) (asset-type (string-ascii 32)))
  (ok (map-set assets asset-id {owner: tx-sender, asset-type: asset-type, status: "operational"})))

(define-public (log-maintenance (asset-id (string-ascii 64)) (maint-type (string-ascii 32)) (score uint))
  (let ((id (var-get record-nonce)))
    (map-set maintenance-records id {asset-id: asset-id, maintenance-type: maint-type, prediction-score: score, timestamp: stacks-block-height})
    (var-set record-nonce (+ id u1))
    (ok id)))

(define-read-only (get-asset (asset-id (string-ascii 64)))
  (ok (map-get? assets asset-id)))

(define-read-only (get-maintenance-record (record-id uint))
  (ok (map-get? maintenance-records record-id)))
