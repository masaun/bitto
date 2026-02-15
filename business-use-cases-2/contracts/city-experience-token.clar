(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-unauthorized (err u103))

(define-map participants principal {points: uint, level: uint, active: bool})
(define-map quests uint {name: (string-ascii 50), reward: uint, required-level: uint, active: bool})
(define-map completions {user: principal, quest-id: uint} {completed-at: uint, reward-claimed: bool})
(define-data-var quest-nonce uint u0)
(define-data-var total-participants uint u0)

(define-read-only (get-participant (user principal))
  (ok (map-get? participants user))
)

(define-read-only (get-quest (quest-id uint))
  (ok (map-get? quests quest-id))
)

(define-read-only (get-completion (user principal) (quest-id uint))
  (ok (map-get? completions {user: user, quest-id: quest-id}))
)

(define-read-only (get-total-participants)
  (ok (var-get total-participants))
)

(define-public (register-participant)
  (let ((participant (map-get? participants tx-sender)))
    (asserts! (is-none participant) err-already-exists)
    (ok (begin
      (map-set participants tx-sender {points: u0, level: u1, active: true})
      (var-set total-participants (+ (var-get total-participants) u1))
      true
    ))
  )
)

(define-public (create-quest (name (string-ascii 50)) (reward uint) (required-level uint))
  (let ((quest-id (var-get quest-nonce)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (begin
      (map-set quests quest-id {name: name, reward: reward, required-level: required-level, active: true})
      (var-set quest-nonce (+ quest-id u1))
      quest-id
    ))
  )
)

(define-public (complete-quest (quest-id uint))
  (let (
    (participant (unwrap! (map-get? participants tx-sender) err-not-found))
    (quest (unwrap! (map-get? quests quest-id) err-not-found))
    (completion (map-get? completions {user: tx-sender, quest-id: quest-id}))
  )
    (asserts! (is-none completion) err-already-exists)
    (asserts! (get active participant) err-unauthorized)
    (asserts! (get active quest) err-unauthorized)
    (asserts! (>= (get level participant) (get required-level quest)) err-unauthorized)
    (ok (begin
      (map-set completions {user: tx-sender, quest-id: quest-id} {completed-at: burn-block-height, reward-claimed: false})
      (map-set participants tx-sender (merge participant {points: (+ (get points participant) (get reward quest))}))
      true
    ))
  )
)

(define-public (claim-reward (quest-id uint))
  (let (
    (completion (unwrap! (map-get? completions {user: tx-sender, quest-id: quest-id}) err-not-found))
  )
    (asserts! (not (get reward-claimed completion)) err-already-exists)
    (ok (begin
      (map-set completions {user: tx-sender, quest-id: quest-id} (merge completion {reward-claimed: true}))
      true
    ))
  )
)

(define-public (update-level (new-level uint))
  (let ((participant (unwrap! (map-get? participants tx-sender) err-not-found)))
    (asserts! (get active participant) err-unauthorized)
    (ok (map-set participants tx-sender (merge participant {level: new-level})))
  )
)

(define-public (deactivate-participant)
  (let ((participant (unwrap! (map-get? participants tx-sender) err-not-found)))
    (ok (map-set participants tx-sender (merge participant {active: false})))
  )
)

(define-public (toggle-quest (quest-id uint))
  (let ((quest (unwrap! (map-get? quests quest-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set quests quest-id (merge quest {active: (not (get active quest))})))
  )
)
