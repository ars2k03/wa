import type { CodeTab } from '@/components/docs/DocsUI';

// Every snippet here must match the real backend (backend/src/whatsapp/whatsapp.controller.ts).
// Tab ids double as language ids so all language tabs on the page switch together.

const EXAMPLE_PHONE = '+8801712345678';
export const EXAMPLE_OTP = '482910';
const EXAMPLE_KEY = '_ars_2k03_a9f1b8c2d3e4f5061728394a5b6c7d8e9f0123456789abcd';

const json = (value: unknown) => JSON.stringify(value, null, 2);

export function sendOtpSnippets(apiUrl: string): CodeTab[] {
  const url = `${apiUrl}/send-otp`;
  return [
    {
      id: 'curl',
      label: 'cURL',
      code: `curl -X POST "${url}" \\
  -H "x-api-key: $WA_GATEWAY_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phoneNumber": "${EXAMPLE_PHONE}",
    "otp": "${EXAMPLE_OTP}"
  }'`,
    },
    {
      id: 'node',
      label: 'Node.js',
      code: `// Node.js 18+ (built-in fetch)
const response = await fetch("${url}", {
  method: "POST",
  headers: {
    "x-api-key": process.env.WA_GATEWAY_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    phoneNumber: "${EXAMPLE_PHONE}",
    otp: "${EXAMPLE_OTP}",
  }),
});

const result = await response.json();
if (!response.ok) throw new Error(result.message);

console.log(result.data.messageId); // "3EB0A1F4C29D7E83B6105F"`,
    },
    {
      id: 'python',
      label: 'Python',
      code: `import os, requests

response = requests.post(
    "${url}",
    headers={"x-api-key": os.environ["WA_GATEWAY_KEY"]},
    json={
        "phoneNumber": "${EXAMPLE_PHONE}",
        "otp": "${EXAMPLE_OTP}",
    },
    timeout=15,
)
response.raise_for_status()

result = response.json()
print(result["data"]["messageId"])  # "3EB0A1F4C29D7E83B6105F"`,
    },
    {
      id: 'php',
      label: 'PHP',
      code: `<?php
$ch = curl_init("${url}");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => [
        "x-api-key: " . getenv("WA_GATEWAY_KEY"),
        "Content-Type: application/json",
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "phoneNumber" => "${EXAMPLE_PHONE}",
        "otp" => "${EXAMPLE_OTP}",
    ]),
]);

$result = json_decode(curl_exec($ch), true);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status !== 200) {
    throw new Exception($result["message"]);
}
echo $result["data"]["messageId"];`,
    },
    {
      id: 'go',
      label: 'Go',
      code: `package main

import ("bytes"; "encoding/json"; "fmt"; "net/http"; "os"; "time")

func main() {
	body, _ := json.Marshal(map[string]string{
		"phoneNumber": "${EXAMPLE_PHONE}",
		"otp":         "${EXAMPLE_OTP}",
	})

	req, _ := http.NewRequest("POST", "${url}", bytes.NewReader(body))
	req.Header.Set("x-api-key", os.Getenv("WA_GATEWAY_KEY"))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer res.Body.Close()

	var result struct {
		Message string \`json:"message"\`
		Data    struct {
			MessageID string \`json:"messageId"\`
		} \`json:"data"\`
	}
	json.NewDecoder(res.Body).Decode(&result)

	if res.StatusCode != http.StatusOK {
		panic(result.Message)
	}
	fmt.Println(result.Data.MessageID)
}`,
    },
  ];
}

export const AUTH_SNIPPETS: CodeTab[] = [
  {
    id: 'x-api-key',
    label: 'x-api-key',
    kind: 'plain',
    code: `x-api-key: ${EXAMPLE_KEY}`,
  },
  {
    id: 'bearer',
    label: 'Bearer',
    kind: 'plain',
    code: `Authorization: Bearer ${EXAMPLE_KEY}`,
  },
];

export const ENV_SNIPPET: CodeTab[] = [
  {
    id: 'env',
    label: '.env',
    kind: 'plain',
    code: `# Keep this file out of git
WA_GATEWAY_KEY=${EXAMPLE_KEY}`,
  },
];

export function verifyFlowSnippets(apiUrl: string): CodeTab[] {
  const url = `${apiUrl}/send-otp`;
  return [
    {
      id: 'node',
      label: 'Node.js',
      code: `import crypto from "node:crypto";

// Use Redis or your database in production.
const codes = new Map();

const hash = (code) => crypto.createHash("sha256").update(code).digest("hex");

// 1. Generate a code, remember it, and send it.
export async function sendLoginCode(phoneNumber) {
  const otp = crypto.randomInt(100000, 1000000).toString();

  codes.set(phoneNumber, {
    hash: hash(otp),
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    attempts: 0,
  });

  const response = await fetch("${url}", {
    method: "POST",
    headers: {
      "x-api-key": process.env.WA_GATEWAY_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber, otp }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

// 2. Check the code the user typed in.
export function verifyLoginCode(phoneNumber, code) {
  const entry = codes.get(phoneNumber);
  if (!entry || Date.now() > entry.expiresAt) return false;

  entry.attempts += 1;
  if (entry.attempts > 5) {
    codes.delete(phoneNumber); // too many wrong tries
    return false;
  }

  const ok = crypto.timingSafeEqual(
    Buffer.from(hash(code)),
    Buffer.from(entry.hash),
  );
  if (ok) codes.delete(phoneNumber); // a code works only once
  return ok;
}`,
    },
    {
      id: 'python',
      label: 'Python',
      code: `import hashlib, hmac, os, secrets, time, requests

# Use Redis or your database in production.
codes = {}


def _hash(code):
    return hashlib.sha256(code.encode()).hexdigest()


# 1. Generate a code, remember it, and send it.
def send_login_code(phone_number):
    otp = f"{secrets.randbelow(1_000_000):06d}"

    codes[phone_number] = {
        "hash": _hash(otp),
        "expires_at": time.time() + 5 * 60,  # 5 minutes
        "attempts": 0,
    }

    response = requests.post(
        "${url}",
        headers={"x-api-key": os.environ["WA_GATEWAY_KEY"]},
        json={"phoneNumber": phone_number, "otp": otp},
        timeout=15,
    )
    if not response.ok:
        raise RuntimeError(response.json()["message"])


# 2. Check the code the user typed in.
def verify_login_code(phone_number, code):
    entry = codes.get(phone_number)
    if not entry or time.time() > entry["expires_at"]:
        return False

    entry["attempts"] += 1
    if entry["attempts"] > 5:
        del codes[phone_number]  # too many wrong tries
        return False

    ok = hmac.compare_digest(_hash(code), entry["hash"])
    if ok:
        del codes[phone_number]  # a code works only once
    return ok`,
    },
    {
      id: 'php',
      label: 'PHP',
      code: `<?php
session_start();

// 1. Generate a code, remember it, and send it.
function sendLoginCode(string $phoneNumber): void
{
    $otp = (string) random_int(100000, 999999);

    // Use your database or Redis in production.
    $_SESSION["otp"][$phoneNumber] = [
        "hash" => hash("sha256", $otp),
        "expires_at" => time() + 5 * 60, // 5 minutes
        "attempts" => 0,
    ];

    $ch = curl_init("${url}");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => [
            "x-api-key: " . getenv("WA_GATEWAY_KEY"),
            "Content-Type: application/json",
        ],
        CURLOPT_POSTFIELDS => json_encode(["phoneNumber" => $phoneNumber, "otp" => $otp]),
    ]);
    $result = json_decode(curl_exec($ch), true);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status !== 200) {
        $message = $result["message"];
        throw new Exception(is_array($message) ? implode(", ", $message) : $message);
    }
}

// 2. Check the code the user typed in.
function verifyLoginCode(string $phoneNumber, string $code): bool
{
    $entry = $_SESSION["otp"][$phoneNumber] ?? null;
    if (!$entry || time() > $entry["expires_at"]) {
        return false;
    }

    $_SESSION["otp"][$phoneNumber]["attempts"]++;
    if ($_SESSION["otp"][$phoneNumber]["attempts"] > 5) {
        unset($_SESSION["otp"][$phoneNumber]); // too many wrong tries
        return false;
    }

    $ok = hash_equals($entry["hash"], hash("sha256", $code));
    if ($ok) {
        unset($_SESSION["otp"][$phoneNumber]); // a code works only once
    }
    return $ok;
}`,
    },
    {
      id: 'go',
      label: 'Go',
      code: `package otp

import ("bytes"; "crypto/rand"; "crypto/sha256"; "crypto/subtle"; "encoding/hex"; "encoding/json"; "fmt"; "math/big"; "net/http"; "os"; "sync"; "time")

type entry struct {
	hash      string
	expiresAt time.Time
	attempts  int
}

// Use Redis or your database in production.
var (
	mu    sync.Mutex
	codes = map[string]*entry{}
)

func hashCode(code string) string {
	sum := sha256.Sum256([]byte(code))
	return hex.EncodeToString(sum[:])
}

// 1. Generate a code, remember it, and send it.
func SendLoginCode(phoneNumber string) error {
	n, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return err
	}
	otp := fmt.Sprintf("%06d", n.Int64())

	mu.Lock()
	codes[phoneNumber] = &entry{hash: hashCode(otp), expiresAt: time.Now().Add(5 * time.Minute)}
	mu.Unlock()

	body, _ := json.Marshal(map[string]string{"phoneNumber": phoneNumber, "otp": otp})
	req, _ := http.NewRequest("POST", "${url}", bytes.NewReader(body))
	req.Header.Set("x-api-key", os.Getenv("WA_GATEWAY_KEY"))
	req.Header.Set("Content-Type", "application/json")

	res, err := (&http.Client{Timeout: 15 * time.Second}).Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		var e struct {
			Message any \`json:"message"\`
		}
		json.NewDecoder(res.Body).Decode(&e)
		return fmt.Errorf("send failed: %v", e.Message)
	}
	return nil
}

// 2. Check the code the user typed in.
func VerifyLoginCode(phoneNumber, code string) bool {
	mu.Lock()
	defer mu.Unlock()

	e, ok := codes[phoneNumber]
	if !ok || time.Now().After(e.expiresAt) {
		return false
	}

	e.attempts++
	if e.attempts > 5 {
		delete(codes, phoneNumber) // too many wrong tries
		return false
	}

	if subtle.ConstantTimeCompare([]byte(hashCode(code)), []byte(e.hash)) != 1 {
		return false
	}
	delete(codes, phoneNumber) // a code works only once
	return true
}`,
    },
  ];
}

export function errorHandlingSnippets(apiUrl: string): CodeTab[] {
  const url = `${apiUrl}/send-otp`;
  return [
    {
      id: 'node',
      label: 'Node.js',
      code: `const response = await fetch("${url}", {
  method: "POST",
  headers: {
    "x-api-key": process.env.WA_GATEWAY_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ phoneNumber, otp }),
});

const body = await response.json();
if (response.ok) return body.data.messageId;

// Validation errors return a list of messages, others a single string.
const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;

switch (response.status) {
  case 400:
    // Bad number or not on WhatsApp: ask the user to check their number.
    throw new UserInputError(message);
  case 429:
    // Too many requests: wait a minute before trying again.
    throw new RetryLaterError(message);
  case 401:
  case 503:
    // Wrong key, or your WhatsApp is disconnected: alert your team.
    // Retrying will not help until it is fixed.
    notifyTeam(message);
    throw new Error("Could not send the code. Please try again later.");
  default:
    throw new Error(message);
}`,
    },
    {
      id: 'python',
      label: 'Python',
      code: `response = requests.post(
    "${url}",
    headers={"x-api-key": os.environ["WA_GATEWAY_KEY"]},
    json={"phoneNumber": phone_number, "otp": otp},
    timeout=15,
)

body = response.json()
if response.ok:
    return body["data"]["messageId"]

# Validation errors return a list of messages, others a single string.
message = body["message"]
if isinstance(message, list):
    message = ", ".join(message)

if response.status_code == 400:
    # Bad number or not on WhatsApp: ask the user to check their number.
    raise UserInputError(message)
elif response.status_code == 429:
    # Too many requests: wait a minute before trying again.
    raise RetryLaterError(message)
elif response.status_code in (401, 503):
    # Wrong key, or your WhatsApp is disconnected: alert your team.
    # Retrying will not help until it is fixed.
    notify_team(message)
    raise RuntimeError("Could not send the code. Please try again later.")
else:
    raise RuntimeError(message)`,
    },
    {
      id: 'php',
      label: 'PHP',
      code: `<?php
$ch = curl_init("${url}");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => [
        "x-api-key: " . getenv("WA_GATEWAY_KEY"),
        "Content-Type: application/json",
    ],
    CURLOPT_POSTFIELDS => json_encode(["phoneNumber" => $phoneNumber, "otp" => $otp]),
]);
$body = json_decode(curl_exec($ch), true);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status === 200) {
    return $body["data"]["messageId"];
}

// Validation errors return a list of messages, others a single string.
$message = is_array($body["message"]) ? implode(", ", $body["message"]) : $body["message"];

switch ($status) {
    case 400:
        // Bad number or not on WhatsApp: ask the user to check their number.
        throw new UserInputException($message);
    case 429:
        // Too many requests: wait a minute before trying again.
        throw new RetryLaterException($message);
    case 401:
    case 503:
        // Wrong key, or your WhatsApp is disconnected: alert your team.
        // Retrying will not help until it is fixed.
        notifyTeam($message);
        throw new Exception("Could not send the code. Please try again later.");
    default:
        throw new Exception($message);
}`,
    },
    {
      id: 'go',
      label: 'Go',
      code: `res, err := client.Do(req)
if err != nil {
	return "", err // network error or timeout
}
defer res.Body.Close()

var body struct {
	Message any \`json:"message"\` // a string, or a list for validation errors
	Data    struct {
		MessageID string \`json:"messageId"\`
	} \`json:"data"\`
}
json.NewDecoder(res.Body).Decode(&body)

if res.StatusCode == http.StatusOK {
	return body.Data.MessageID, nil
}
message := fmt.Sprint(body.Message)

switch res.StatusCode {
case http.StatusBadRequest:
	// Bad number or not on WhatsApp: ask the user to check their number.
	return "", &UserInputError{Message: message}
case http.StatusTooManyRequests:
	// Too many requests: wait a minute before trying again.
	return "", ErrRetryLater
case http.StatusUnauthorized, http.StatusServiceUnavailable:
	// Wrong key, or your WhatsApp is disconnected: alert your team.
	// Retrying will not help until it is fixed.
	notifyTeam(message)
	return "", errors.New("could not send the code, please try again later")
default:
	return "", errors.New(message)
}`,
    },
  ];
}

export const SUCCESS_RESPONSE = json({
  statusCode: 200,
  success: true,
  message: 'OTP sent successfully',
  data: {
    messageId: '3EB0A1F4C29D7E83B6105F',
    recipientJid: '8801712345678@s.whatsapp.net',
  },
});

export const ERROR_EXAMPLES: CodeTab[] = [
  {
    id: '400-validation',
    label: '400 · Missing field',
    code: json({
      message: ['OTP code is required'],
      error: 'Bad Request',
      statusCode: 400,
    }),
  },
  {
    id: '400-whatsapp',
    label: '400 · Not on WhatsApp',
    code: json({
      message: 'Number 8801712345678 is not registered on WhatsApp.',
      error: 'Bad Request',
      statusCode: 400,
    }),
  },
  {
    id: '401',
    label: '401',
    code: json({
      message: 'Invalid API key',
      error: 'Unauthorized',
      statusCode: 401,
    }),
  },
  {
    id: '429',
    label: '429',
    code: json({
      statusCode: 429,
      message: 'ThrottlerException: Too Many Requests',
    }),
  },
  {
    id: '503',
    label: '503',
    code: json({
      message: 'WhatsApp device is not connected. Please connect your device in the WhatsApp Device tab first.',
      error: 'Service Unavailable',
      statusCode: 503,
    }),
  },
];
