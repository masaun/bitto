(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-program-not-found (err u102))

(define-map programs uint {
  name: (string-ascii 100),
  department: (string-ascii 50),
  budget: uint,
  allocated: uint,
  start-date: uint,
  end-date: uint,
  status: (string-ascii 20)
})

(define-map expenditures {program-id: uint, expenditure-id: uint} {
  description: (string-ascii 200),
  amount: uint,
  vendor: principal,
  timestamp: uint
})

(define-data-var program-nonce uint u0)

(define-read-only (get-program (program-id uint))
  (ok (map-get? programs program-id)))

(define-read-only (get-expenditure (program-id uint) (expenditure-id uint))
  (ok (map-get? expenditures {program-id: program-id, expenditure-id: expenditure-id})))

(define-public (create-program (name (string-ascii 100)) (department (string-ascii 50)) (budget uint) (duration uint))
  (let ((program-id (+ (var-get program-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set programs program-id {
      name: name,
      department: department,
      budget: budget,
      allocated: u0,
      start-date: stacks-block-height,
      end-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set program-nonce program-id)
    (ok program-id)))

(define-public (record-expenditure (program-id uint) (expenditure-id uint) (description (string-ascii 200)) (amount uint) (vendor principal))
  (let ((program (unwrap! (map-get? programs program-id) err-program-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= (+ (get allocated program) amount) (get budget program)) err-not-authorized)
    (map-set expenditures {program-id: program-id, expenditure-id: expenditure-id} {
      description: description,
      amount: amount,
      vendor: vendor,
      timestamp: stacks-block-height
    })
    (ok (map-set programs program-id 
      (merge program {allocated: (+ (get allocated program) amount)})))))

(define-public (update-program-status (program-id uint) (status (string-ascii 20)))
  (let ((program (unwrap! (map-get? programs program-id) err-program-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set programs program-id (merge program {status: status})))))
