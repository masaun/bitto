(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map identities
  {did: (string-ascii 128)}
  {
    individual: principal,
    name-hash: (buff 32),
    biometric-hash: (buff 32),
    verified: bool,
    verifier: principal,
    created-at: uint,
    updated-at: uint,
    status: (string-ascii 16)
  }
)

(define-map credentials
  {credential-id: uint}
  {
    did: (string-ascii 128),
    credential-type: (string-ascii 64),
    issuer: principal,
    data-hash: (buff 32),
    issued-at: uint,
    expires-at: uint,
    revoked: bool
  }
)

(define-map authorized-verifiers
  {verifier: principal}
  {authorized: bool, organization: (string-ascii 128)}
)

(define-data-var credential-nonce uint u0)

(define-read-only (get-identity (did (string-ascii 128)))
  (map-get? identities {did: did})
)

(define-read-only (get-credential (credential-id uint))
  (map-get? credentials {credential-id: credential-id})
)

(define-read-only (is-authorized-verifier (verifier principal))
  (match (map-get? authorized-verifiers {verifier: verifier})
    verifier-data (get authorized verifier-data)
    false
  )
)

(define-public (authorize-verifier (verifier principal) (organization (string-ascii 128)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set authorized-verifiers {verifier: verifier}
      {authorized: true, organization: organization}
    ))
  )
)

(define-public (create-identity
  (did (string-ascii 128))
  (individual principal)
  (name-hash (buff 32))
  (biometric-hash (buff 32))
)
  (let ((verifier-data (unwrap! (map-get? authorized-verifiers {verifier: tx-sender}) err-unauthorized)))
    (asserts! (get authorized verifier-data) err-unauthorized)
    (ok (map-set identities {did: did}
      {
        individual: individual,
        name-hash: name-hash,
        biometric-hash: biometric-hash,
        verified: true,
        verifier: tx-sender,
        created-at: stacks-block-height,
        updated-at: stacks-block-height,
        status: "active"
      }
    ))
  )
)

(define-public (issue-credential
  (did (string-ascii 128))
  (credential-type (string-ascii 64))
  (data-hash (buff 32))
  (duration uint)
)
  (let (
    (identity (unwrap! (map-get? identities {did: did}) err-not-found))
    (credential-id (var-get credential-nonce))
  )
    (asserts! (get verified identity) err-unauthorized)
    (map-set credentials {credential-id: credential-id}
      {
        did: did,
        credential-type: credential-type,
        issuer: tx-sender,
        data-hash: data-hash,
        issued-at: stacks-block-height,
        expires-at: (+ stacks-block-height duration),
        revoked: false
      }
    )
    (var-set credential-nonce (+ credential-id u1))
    (ok credential-id)
  )
)

(define-public (revoke-credential (credential-id uint))
  (let ((credential (unwrap! (map-get? credentials {credential-id: credential-id}) err-not-found)))
    (asserts! (is-eq tx-sender (get issuer credential)) err-unauthorized)
    (ok (map-set credentials {credential-id: credential-id}
      (merge credential {revoked: true})
    ))
  )
)

(define-public (update-identity-status (did (string-ascii 128)) (new-status (string-ascii 16)))
  (let ((identity (unwrap! (map-get? identities {did: did}) err-not-found)))
    (asserts! (is-eq tx-sender (get verifier identity)) err-unauthorized)
    (ok (map-set identities {did: did}
      (merge identity {status: new-status, updated-at: stacks-block-height})
    ))
  )
)
