# 5단계: 제네릭

### 5-1. 왜 필요한가?

배열의 첫 번째 값을 꺼내는 함수를 만든다고 해 봅시다.

```ts
// 방법 1: 타입마다 따로 만듦 → 똑같은 코드 반복 😩
function firstNumber(arr: number[]): number { return arr[0]; }
function firstString(arr: string[]): string { return arr[0]; }

// 방법 2: any로 하나로 합침 → 타입 정보가 사라짐 😱
function firstAny(arr: any[]): any { return arr[0]; }
const v = firstAny(["a", "b"]);   // v: any → 1단계에서 배운 위험한 상태
v.push(1);                        // 빨간 줄 없음 → 실행하면 💥
```

### 5-2. 제네릭 `<T>`: 타입을 매개변수처럼 받기

```ts
function first<T>(arr: T[]): T {
  return arr[0];
}
```

`T`는 **"호출할 때 정해지는 타입"을 담는 빈칸**입니다. 함수 매개변수가 값을 받듯, `<T>`는 타입을 받습니다.

```ts
const a = first([1, 2, 3]);       // T = number → a: number
const b = first(["x", "y"]);      // T = string → b: string
b.toUpperCase();                  // ✅ string이라고 알고 있음
b.push(1);                        // ❌ string에 push 없음. 제대로 잡아 줌!
```

`T`를 직접 적지 않아도 **넣은 값을 보고 추론합니다.** 직접 적을 수도 있습니다: `first<number>([1, 2, 3])`.

### 5-3. 제네릭 타입

객체 타입에도 빈칸을 둘 수 있습니다. API 응답 모양을 정의할 때 자주 씁니다.

```ts
type ApiResponse<T> = {
  status: number;
  data: T;          // data의 모양만 매번 다름
};

type User = { name: string };

const r1: ApiResponse<User> = { status: 200, data: { name: "철수" } };
const r2: ApiResponse<string[]> = { status: 200, data: ["a", "b"] };
const r3: ApiResponse<User> = { status: 200, data: "철수" };   // ❌ data는 User여야 함
```

### 5-4. 이미 써 본 제네릭들 ⭐

사실 앞에서 제네릭을 이미 봤습니다. 앞으로 나올 것들도 전부 같은 원리입니다.

| 코드 | 뜻 | 나오는 단계 |
|---|---|---|
| `Array<number>` | number를 담는 배열 | 1단계 |
| `Promise<User>` | 나중에 User를 돌려줄 약속 | **6단계** |
| `useState<User \| null>(null)` | User 또는 null을 담는 상태 | **8단계** |

`<>` 안에 들어간 타입은 **"이 상자 안에 무엇이 들어 있는지"**라고 읽으면 됩니다.

### 5-5. 제약 조건 `extends`: 빈칸에 조건 걸기

```ts
// T는 아무 타입이나 되면 안 되고, length 속성이 있어야 함
function getLength<T extends { length: number }>(x: T): number {
  return x.length;
}

getLength("hello");     // ✅ 문자열은 length 있음
getLength([1, 2, 3]);   // ✅ 배열도 length 있음
getLength(123);         // ❌ number에는 length 없음
```

## 🧪 5단계 연습 문제

> 💡 **제출 전에 https://www.typescriptlang.org/play 에 붙여 넣어 보세요.** 빨간 줄이 따옴표 누락 같은 실수를 바로 알려 줍니다. 실무에서도 이렇게 에디터의 도움을 받으며 코드를 씁니다.

**문제 1.** 5-2의 `first` 함수를 사용할 때, 각 변수의 타입을 맞혀 보세요.
```ts
const p = first([true, false]);
const q = first([{ id: 1 }, { id: 2 }]);
```

**문제 2.** 배열의 **마지막** 값을 반환하는 제네릭 함수 `last`를 작성해 주세요.
> 💡 힌트: 마지막 값의 위치는 `arr.length - 1`입니다.

**문제 3.** 아래 코드에서 에러가 나는 줄을 고르고 이유를 써 주세요.
```ts
type Box<T> = { value: T };

const b1: Box<string> = { value: "hi" };    // (가)
const b2: Box<number> = { value: "10" };    // (나)
const b3: Box<string[]> = { value: ["a"] }; // (다)
const b4: Box<boolean> = { value: 1 };      // (라)
```

**문제 4. (4단계 문제 3 다시 쓰기)** 위 표의 ①~④를 모두 고쳐서 `describe` 함수를 다시 작성해 주세요.
```ts
type Result =
  | { status: "success"; users: string[] }
  | { status: "error"; message: string };

// 성공 → "N명 불러옴" / 실패 → "에러: 메시지"
```

## ✍️ 내 답

```text
1. boolean, {id:number}

2. function last<T>(arr :T[]):T => arr[arr.length-1]

3. 나 : 넘버가 아님

4. 


function describe(result:Result) {
    if(result.status === "success") {
     return `${result.length}명 불러옴`;
   } else if(result.status ==="error") {
     return `에러 : ${result.message}`
   }
  }
```

## ✅ 채점·피드백 (정답 포함)

### 문제 1 ✅ 정답

`p: boolean`, `q: { id: number }` 정확합니다. 객체 배열에서도 `T`가 객체 모양 그대로 추론된다는 점을 잘 이해하셨습니다.

### 문제 2 🔺 로직은 정답, 문법 두 가지가 섞임

`arr[arr.length - 1]`로 마지막 값을 꺼내는 로직과 `<T>` 사용은 정확합니다. 그런데 **`function` 선언과 화살표 `=>`를 한 줄에 섞어서** 문법 에러가 납니다.

```ts
// ❌ 제출: function과 => 를 같이 씀
function last<T>(arr: T[]): T => arr[arr.length - 1]

// ✅ 방법 1: function 선언 → { } 와 return
function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

// ✅ 방법 2: 화살표 함수 → const 변수에 담고 =>
const last = <T>(arr: T[]): T => arr[arr.length - 1];
```

| | 시작 | 몸통 |
|---|---|---|
| function 선언 | `function 이름(...)` | `{ return ...; }` |
| 화살표 함수 | `const 이름 = (...)` | `=> 값` |

> 참고: 빈 배열 `last([])`는 `undefined`를 돌려주므로, 더 엄격하게 쓰면 반환 타입을 `T | undefined`로 둡니다. 지금은 `T`로도 충분합니다.

### 문제 3 🔺 (나)는 정답, (라)를 놓침

| 줄 | 판정 |
|---|---|
| (가) `Box<string>` ← `"hi"` | 정상 |
| (나) `Box<number>` ← `"10"` | ❌ ✅ 찾으셨습니다. `"10"`은 따옴표가 있어서 string |
| (다) `Box<string[]>` ← `["a"]` | 정상 |
| (라) `Box<boolean>` ← `1` | ❌ **놓친 줄**: `1`은 number입니다. boolean은 `true`·`false`만 됩니다 |

> 💡 다른 언어(C 등)에서는 `1`을 참으로 쓰기도 하지만 TypeScript에서 `1`은 그냥 number입니다.

### 문제 4 🔺 거의 다 왔습니다! 한 군데만 남음

지난번 4곳 중 **3곳을 고치셨습니다** 👏

| # | 지난번 | 이번 |
|---|---|---|
| ① 따옴표 | `"success)` | ✅ `"success"` |
| ② ₩ 기호 | `` `₩${` `` | ✅ 제거됨 |
| ③ 길이 | `result.size()` | 🔺 `result.length` |
| ④ 형식 | `에러${` | ✅ `에러 : ${` |

**③이 아직 에러입니다.** `result`는 배열이 아니라 **객체**입니다.

```ts
result = { status: "success", users: ["철수", "영희"] }
//                               ↑ 배열은 여기 있음
```

`result.length` → ❌ 객체에는 length가 없습니다. **`result.users.length`** → ✅ users 배열의 길이입니다.

최종 정답입니다.

```ts
function describe(result: Result): string {
  if (result.status === "success") {
    return `${result.users.length}명 불러옴`;
  } else {
    return `에러: ${result.message}`;
  }
}
```

> 💡 `else if (result.status === "error")`도 맞지만, status가 두 가지뿐이니 `else`만 써도 TypeScript가 error 쪽으로 좁혀 줍니다.

**5단계 완료!** 이제 처음에 요청하신 **Promise**입니다.
