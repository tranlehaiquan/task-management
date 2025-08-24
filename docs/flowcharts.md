## Verify email flow

```mermaid
flowchart TD
    A[Gateway] -->|verify email| B(User Service)
    B --> C{Check User valid}
    C -->|No| End(End)
    C -->|Yes| D{Is verification email existing?}
    D -->|No| F[Create new Verify Email]
    F --> End

    D -->|Yes| E{Has verification expired?}
    E -->|No| G[Resend existing verification email]
    E -->|Yes| H[Update verification expiry]
    H --> End
    G --> End
```

## Forgot password flow

```mermaid
flowchart TD
    A[User] -->|POST /forgot-password| B(API Gateway)
    B --> C(Rate Limiting Check)
    C -->|Too many requests| D[Return 429 - Rate Limited]
    C -->|Within limits| E{Does account exist?}

    E -->|No| F[Return generic success message<br/>⚠️ Don't reveal account doesn't exist]
    E -->|Yes| G{Is account active?}

    G -->|No| F
    G -->|Yes| H{Existing reset token?}

    H -->|Yes| I{Token still valid?}
    I -->|Yes| J[Invalidate old token]
    I -->|No| K[Clean up expired token]

    H -->|No| L[Generate secure token]
    J --> L
    K --> L

    L --> M[Store token with expiration<br/>⏰ 15-30 min TTL]
    M --> N[Log security event]
    N --> O[Send reset email<br/>📧 Include token & instructions]

    O --> P[Return generic success message]
    F --> P
    P --> Q[End]

    style D fill:#ffcccc
    style F fill:#fff2cc
    style N fill:#e1f5fe
    style O fill:#e8f5e8
```

```mermaid
flowchart TD
    A[User clicks reset link] --> B[Frontend extracts token from URL]

    subgraph "API 1: Validate Token"
        B -->|GET /api/validate-forgot-password-token?token=xyz| C(Rate Limiting)
        C --> D{Token format valid?}
        D -->|No| E[400: Invalid token format]
        D -->|Yes| F[Hash token for lookup]
        F --> G{Token exists & valid?}
        G -->|No| H[400: Invalid/expired token]
        G -->|Yes| I[200: Token valid]
    end

    E --> J[Frontend shows error]
    H --> J
    I --> K[Frontend shows password form]

    subgraph "API 2: Reset Password"
        K --> L[User enters new password]
        L -->|POST /api/reset-password| M(Rate Limiting)
        M --> N{Password validation}
        N -->|Fail| O[400: Validation errors]
        N -->|Pass| P{Token still valid?}
        P -->|No| Q[400: Token expired/used]
        P -->|Yes| R[Update password]
        R --> S[Delete/mark token used]
        S --> T[Invalidate user sessions]
        T --> U[Log security event]
        U --> V[Send confirmation email]
        V --> W[200: Password reset success]
    end

    O --> K
    Q --> X[Frontend shows error]
    W --> Y[Frontend redirects to login]
    J --> Z[End]
    X --> Z
    Y --> Z

    style E fill:#ffcccc
    style H fill:#ffcccc
    style O fill:#ffcccc
    style Q fill:#ffcccc
    style I fill:#e8f5e8
    style W fill:#e8f5e8
```
