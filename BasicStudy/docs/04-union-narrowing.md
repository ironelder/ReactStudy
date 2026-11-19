# 4단계: 유니온과 타입 좁히기

### 4-1. 유니온 `|`: "이것 또는 저것"

```ts
let id: string | number;
id = "abc";   // ✅
id = 123;     // ✅
id = true;    // ❌ string도 number도 아님
```

단, 유니온 타입 값은 **양쪽 모두 가진 기능만** 바로 쓸 수 있습니다.

```ts
function printId(id: string | number) {
  id.toUpperCase();   // ❌ number에는 toUpperCase가 없음
  id.toString();      // ✅ string, number 둘 다 가지고 있음
}
```

### 4-2. 타입 좁히기: `typeof`로 확인하기

1단계 `unknown`에서 본 그 방법입니다. 확인하면 **그 블록 안에서는 타입이 좁혀집니다.**

```ts
function printId(id: string | number) {
  if (typeof id === "string") {
    console.log(id.toUpperCase());   // 여기서 id: string ✅
  } else {
    console.log(id.toFixed(2));      // 여기서 id: number ✅ (string이 아니니까)
  }
}
```

### 4-3. 리터럴 유니온: 정해진 값만 허용

1단계에서 배운 리터럴 타입(`"hello"`)을 `|`로 묶으면 **선택지 목록**이 됩니다. 실무에서 정말 많이 씁니다.

```ts
type Status = "loading" | "success" | "error";

let s: Status = "loading";  // ✅
s = "success";              // ✅
s = "done";                 // ❌ 목록에 없음
s = "Success";              // ❌ 대소문자도 구분
```

오타로 `"sucess"`를 써도 바로 잡아 주고, 에디터에서 따옴표만 치면 **선택지 3개를 자동완성**으로 보여 줍니다.

### 4-4. `null`과의 유니온, 그리고 `?.` ⭐ React에서 매우 중요

데이터를 아직 못 불러왔을 때를 표현할 때 씁니다. **8단계 `useState<User | null>(null)`이 바로 이것**입니다.

```ts
type User = { name: string };

let user: User | null = null;

user.name;           // ❌ 'user'는 'null'일 수 있습니다.

if (user !== null) {
  user.name;         // ✅ 확인했으니 OK
}

user?.name;          // ✅ 옵셔널 체이닝: user가 null이면 에러 대신 undefined를 돌려줌
```

### 4-5. 구별된 유니온: 상태마다 다른 데이터

`status` 같은 **공통 리터럴 속성**으로 어떤 모양인지 구별합니다.

```ts
type Result =
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };

function show(r: Result) {
  if (r.status === "success") {
    console.log(r.data.length);   // ✅ 여기서는 data가 있는 쪽
  } else {
    console.log(r.message);       // ✅ 여기서는 message가 있는 쪽
  }
  r.data;   // ❌ 확인 전에는 error 쪽일 수도 있으니 불가
}
```

이 패턴은 6단계 비동기 API 결과를 다룰 때 다시 씁니다.

## 🧪 4단계 연습 문제

**문제 1.** 아래 함수를 완성해 주세요. 숫자가 들어오면 `"#123"`처럼 앞에 `#`을 붙이고, 문자열이 들어오면 대문자로 바꿔서 반환합니다.
```ts
function formatCode(code: string | number): string {
  // 여기를 채워 주세요
}
```

**문제 2.** 에러가 나는 줄을 모두 고르세요.
```ts
type Size = "S" | "M" | "L";

let a: Size = "M";    // (가)
let b: Size = "XL";   // (나)
let c: Size = "s";    // (다)
let d: Size = "L";    // (라)
```

**문제 3.** 아래 `Result` 타입을 받아서, 성공이면 `"N명 불러옴"`(N은 `users` 배열 길이)을, 실패면 `"에러: 메시지"`를 반환하는 함수 `describe`를 작성해 주세요.
```ts
type Result =
  | { status: "success"; users: string[] }
  | { status: "error"; message: string };
```

**문제 4. (3단계 복습)** 아래 코드가 에러 나는 **정확한 이유**를 써 주세요.
```ts
type Point = { x: number; y: number };
const p: Point = { x: 1, y: 2, z: 3 };
```

## ✍️ 내 답

```text
function formatCode(code: string | number): string {
  // 여기를 채워 주세요
 if(typeof code === "number" )
   return `#${code}`;
}

나, 다

function describe(result:Result) {
  if(result.status === "success) {
   return `₩${result.size()}명 불러옴`;
 } else if(result.status ==="error") {
   return `에러${result.message}`
}
}

z는 없는 속성이야.
```

## ✅ 채점·피드백 (정답 포함)

### 문제 1 🔺 미완성: 문자열을 처리하는 부분이 빠짐

숫자 처리(`typeof code === "number"` → `` `#${code}` ``)는 정확합니다. 그런데 **문자열이 들어오면 아무것도 반환하지 않아서** 에러가 납니다.

```
❌ 함수에 끝 return 문이 없으며 반환 형식에 'undefined'가 포함되지 않습니다.
```

반환 타입을 `: string`으로 정했으니 **모든 경우에** string을 돌려줘야 합니다. TypeScript는 "문자열이 들어오면 뭘 반환하지?"를 검사해서 빠진 경우를 잡아 줍니다.

```ts
function formatCode(code: string | number): string {
  if (typeof code === "number") {
    return `#${code}`;
  }
  return code.toUpperCase();   // 여기까지 왔으면 code는 string으로 좁혀짐
}
```

마지막 줄에 `else`가 없어도 TypeScript는 "number가 아니면 string"이라고 알아서 좁혀 줍니다.

### 문제 2 ✅ 정답

(나) `"XL"`은 목록에 없고, (다) `"s"`는 소문자라서 에러입니다. 정확합니다.

### 문제 3 🔺 구조는 맞음, 고칠 곳이 4군데

`result.status`로 성공과 실패를 나눈 **구별된 유니온의 핵심 구조는 정확합니다.** 👍 다만 세부 실수가 있습니다.

| # | 제출한 코드 | 문제 |
|---|---|---|
| ① | `"success)` | 닫는 따옴표 `"`가 빠져서 **문법 에러**. 뒤 코드 전체가 문자열로 읽힙니다 |
| ② | `` `₩${...}` `` | `₩`가 그대로 출력됩니다 → `"₩3명 불러옴"`. 한글 키보드에서 `\` 키가 `₩`로 입력되니 주의하세요 |
| ③ | `result.size()` | `Result`에 `size`라는 속성이 없어서 **에러**. 사람 목록은 `users`에 있고, **JavaScript 배열 길이는 `.length`**(괄호 없음)입니다 |
| ④ | `` `에러${...}` `` | 요구한 형식은 `"에러: 메시지"`인데 `": "`가 빠졌습니다 |

> 💡 ③의 `size()`와 3단계의 `function` 누락을 보면 **Java 같은 다른 언어 경험**이 있으신 것 같아요. JavaScript에서는 배열 길이가 `list.size()`가 아니라 `list.length`입니다.

이 문제는 정답 코드를 바로 드리지 않고, 아래 **5단계 문제 4**에서 직접 고쳐 보시도록 남겨 두겠습니다.

### 문제 4 ✅ 정답

"z는 없는 속성" 정확합니다. 지난번에 헷갈린 부분을 이번엔 바로 맞히셨네요. 👏

**4단계 완료!** 다음은 `Promise<T>`, `useState<T>`를 이해하는 열쇠인 제네릭입니다.


## 🔁 5단계에서 재도전: 문제 3 (`describe`)

이 문제는 정답을 바로 알려 주지 않고 5단계 문제 4에서 다시 풀도록 남겨 두었습니다. 재도전에서 제출한 답과 최종 정답은 [05-generics.md](05-generics.md) 의 문제 4에서 볼 수 있고, 핵심만 아래에 옮깁니다.

**재도전에서 제출한 답**

```ts
function describe(result:Result) {
    if(result.status === "success") {
     return `${result.length}명 불러옴`;
   } else if(result.status ==="error") {
     return `에러 : ${result.message}`
   }
  }
```

**최종 정답**

```ts
function describe(result: Result): string {
  if (result.status === "success") {
    return `${result.users.length}명 불러옴`;
  } else {
    return `에러: ${result.message}`;
  }
}
```
