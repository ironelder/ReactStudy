# 1단계: 기본 타입

### 1-1. TypeScript를 쓰는 이유

TypeScript는 **JavaScript에 "타입"을 붙인 언어**입니다. 가장 큰 장점은 실행하기 전에 실수를 잡아 준다는 점입니다.

```ts
// JavaScript: 실행해 봐야 문제를 알 수 있음
function double(x) { return x * 2; }
double("10");   // "10" * 2 = 20 ... 우연히 동작하지만 의도와 다름

// TypeScript: 코드를 쓰는 순간 에디터가 빨간 줄로 알려 줌
function double(x: number) { return x * 2; }
double("10");   // ❌ 'string' 형식의 인수는 'number' 형식의 매개변수에 할당될 수 없습니다.
```

### 1-2. 원시 타입

변수 이름 뒤에 `: 타입`을 붙입니다.

```ts
let name: string = "철수";
let age: number = 30;          // 정수와 소수 구분 없이 모두 number
let isDev: boolean = true;
let nothing: null = null;
let notYet: undefined = undefined;
```

### 1-3. 배열

```ts
let scores: number[] = [90, 85, 77];
let tags: string[] = ["ts", "react"];

// 같은 뜻의 다른 표기 (5단계 제네릭에서 다시 다룹니다)
let scores2: Array<number> = [90, 85, 77];

scores.push("100");  // ❌ number 배열에 string은 넣을 수 없음
```

### 1-4. 타입 추론 ⭐ 중요

**타입을 일일이 적지 않아도 됩니다.** 처음 넣은 값을 보고 TypeScript가 알아서 타입을 정합니다.

```ts
let city = "서울";   // 마우스를 올리면 → let city: string
city = 123;          // ❌ 이미 string으로 정해졌기 때문에 에러

const PI = 3.14;     // const는 바뀌지 않으므로 → const PI: 3.14 (값 자체가 타입이 됨)
```

> 💡 **실무 습관**: 바로 값을 넣는 변수에는 타입을 적지 않고 추론에 맡깁니다. 타입은 **함수 매개변수**처럼 추론할 수 없는 곳에 적습니다.

### 1-5. `any`와 `unknown`

```ts
let a: any = 10;
a.toUpperCase();     // 에러가 안 남 → 실행하면 터짐 💥 (타입 검사를 끄는 것과 같음)

let u: unknown = 10;
u.toUpperCase();     // ❌ 에러: 무슨 타입인지 확인하기 전에는 쓸 수 없음
if (typeof u === "string") {
  u.toUpperCase();   // ✅ 여기서는 string임이 확인됐으므로 OK
}
```

- `any`: "검사하지 마" → TypeScript를 쓰는 의미가 사라지므로 **되도록 쓰지 않습니다**
- `unknown`: "아직 모르니 확인하고 써" → 안전한 대안입니다

## 🧪 1단계 연습 문제

**문제 1.** 아래 코드에서 에러가 나는 줄을 모두 찾고, 이유를 한 줄씩 써 주세요.
```ts
let title = "TS 공부";
let count: number = 0;
let done = false;

title = "React 공부";
count = "1";
done = 0;
let list: string[] = ["a", "b", 3];
```

**문제 2.** 마우스를 올렸을 때 TypeScript가 추론하는 타입이 무엇일지 맞혀 보세요.
```ts
let x = 42;
const y = "hello";
let z = [1, 2, 3];
```

**문제 3.** 아래 두 코드 중 어느 쪽이 에러를 내는지 고르고, 그쪽이 더 **안전한** 이유를 설명해 주세요.
```ts
// 코드 A
let data: any = "hi";
data.push(1);

// 코드 B
let data2: unknown = "hi";
data2.push(1);
```

---

답을 편하게 보내 주세요. 모르는 문제는 "모르겠어요"라고 하셔도 됩니다. 힌트를 드리겠습니다. 🙂

## ✍️ 내 답

```text
count, done, 타입이 다르고 list가 내부 배열에 타입이 서로 다름

x : number
y : string
z : Array<string>

문제 3은 unknown인데 이미 문자가 들어가서 string로 되니까 1 넣으면  에러나고, any가 더 안전할거야 모든 타입에 대한 걸 받는다고 되어있어
```

## ✅ 채점·피드백 (정답 포함)

### 문제 1 ✅ 정답

에러가 나는 세 줄을 모두 찾았습니다.

```ts
count = "1";                     // ❌ number 자리에 string
done = 0;                        // ❌ boolean 자리에 number
let list: string[] = ["a", "b", 3]; // ❌ string 배열에 number(3)
```

`done`에는 타입을 적지 않았는데도 `false`를 보고 **boolean으로 추론**했기 때문에 에러가 납니다. 이 점까지 잡으신 거라 아주 좋습니다. 👍
(`title = "React 공부"`는 string에 string을 넣었으니 정상입니다.)

### 문제 2 🔺 3개 중 1개 정답

| 변수 | 제출한 답 | 정답 | 설명 |
|---|---|---|---|
| `let x = 42` | number | **number** ✅ | |
| `const y = "hello"` | string | **"hello"** ❌ | 아래에서 설명 |
| `let z = [1, 2, 3]` | Array\<string> | **number[]** ❌ | 안에 든 값이 1, 2, 3 숫자이므로 number 배열입니다. (`number[]`와 `Array<number>`는 같은 뜻이라 형식은 어느 쪽으로 써도 됩니다) |

**`let`과 `const`의 추론 차이**를 정리하면 이렇습니다.

```ts
let a = "hello";    // a: string   → 나중에 "bye"로 바뀔 수 있으니 넓게 잡음
const b = "hello";  // b: "hello"  → 절대 안 바뀌니 값 자체를 타입으로 잡음
```

`"hello"`처럼 **특정 값 하나만 허용하는 타입**을 *리터럴 타입*이라고 합니다. 4단계에서 `"success" | "error"` 같은 형태로 아주 많이 쓰게 되니 지금은 "const는 값 자체가 타입이 된다"만 기억해 두세요.

### 문제 3 ❌ 오답: 중요한 개념이라 자세히 볼게요

**에러는 코드 B에서 납니다. 그리고 더 안전한 쪽은 `unknown`입니다.**

#### 오해 ①: "문자가 들어갔으니 string이 된다"

```ts
let data2: unknown = "hi";
```

`: unknown`처럼 **타입을 직접 적으면 그 타입이 우선합니다.** 안에 "hi"가 들어 있어도 TypeScript는 data2를 계속 `unknown`으로 봅니다. 그래서 B의 에러 메시지는 "string에 push가 없다"가 아니라 이렇게 나옵니다.

```
❌ 'data2'은(는) 'unknown' 형식입니다.
```

#### 오해 ②: "모든 타입을 받으니 any가 더 안전하다"

이 부분이 핵심입니다. 둘 다 **값을 받을 때는** 무엇이든 받습니다. 차이는 **값을 쓸 때** 생깁니다.

| | 값 넣기 | 값 쓰기 (`.push()` 등) |
|---|---|---|
| `any` | 아무거나 OK | **검사 없이 그냥 통과** |
| `unknown` | 아무거나 OK | **타입을 확인하기 전에는 막음** |

실제로 코드 A를 실행하면 이렇게 됩니다.

```ts
let data: any = "hi";
data.push(1);   // 에디터: 조용함 😶
                // 실행: 💥 TypeError: data.push is not a function
```

- **코드 A(any)**: 에디터는 아무 말도 안 하다가 **사용자가 앱을 쓰는 도중에** 터집니다
- **코드 B(unknown)**: 코드를 쓰는 순간 빨간 줄로 막아 줍니다

TypeScript에서 "안전하다"는 말은 **실행하기 전에 에러를 미리 알려 준다**는 뜻입니다. 그래서 에러를 내 주는 `unknown`이 더 안전합니다. 처음엔 "에러가 나는 쪽이 안전하다"는 게 반대로 느껴질 수 있는데, TypeScript의 에러는 **미리 받는 경고**라고 생각하시면 됩니다.

`unknown`은 이렇게 확인한 뒤에 씁니다.

```ts
let data2: unknown = "hi";
if (typeof data2 === "string") {
  data2.toUpperCase();  // ✅ 여기서는 string으로 확인됐으니 OK
}
```


## 🔁 보충 문제 (헷갈린 부분 재확인)

**보충 1.** 각 변수의 추론 타입을 써 주세요.
```ts
let fruit = "사과";
const color = "red";
let prices = [1000, 2500];
const flags = [true, false];
```

**보충 2.** 아래 코드를 실행하면 어떻게 될까요? **에디터에서 빨간 줄이 뜨는지**와 **실행했을 때 터지는지**를 각각 답해 주세요.
```ts
let value: any = 123;
value.toUpperCase();
```
그리고 `any`를 `unknown`으로 바꾸면 결과가 어떻게 달라지는지도 써 주세요.

맞히시면 바로 **2단계(함수 타입)**로 넘어갑니다. 🚀

### 보충 문제: 내 답

```text
fruit : string
color : "red"
prices : Array<number>
flags : [true, false]

2번은 에디터에서 빨간줄이 뜨지 않고, 실행했을때 터짐 
unknown으로 바꾸면 빨간줄이 뜸
```

### 보충 문제: 채점·피드백 (정답 포함)

#### 보충 1 🔺 4개 중 3개 정답

| 변수 | 제출한 답 | 정답 |
|---|---|---|
| `let fruit = "사과"` | string | ✅ |
| `const color = "red"` | "red" | ✅ 지난번에 틀린 부분을 바로 잡으셨네요 👏 |
| `let prices = [1000, 2500]` | Array\<number> | ✅ (`number[]`와 같은 뜻) |
| `const flags = [true, false]` | [true, false] | ❌ 정답은 **`boolean[]`** |

`const`인데 왜 값 자체가 타입이 되지 않을까요? **`const`는 변수에 다른 배열을 넣지 못하게 막을 뿐, 배열 안의 내용은 바꿀 수 있기 때문**입니다.

```ts
const flags = [true, false];
flags = [false];     // ❌ 다른 배열로 바꾸기: const라서 불가
flags.push(true);    // ✅ 내용 바꾸기: 가능!
flags[0] = false;    // ✅ 가능!
```

내용이 바뀔 수 있으니 TypeScript는 넓게 잡아서 `boolean[]`로 추론합니다.

> 📌 정리: `const`로 값 자체가 타입이 되는 건 **문자열·숫자·boolean 같은 원시 값**일 때뿐입니다. 배열·객체는 `const`여도 넓게 추론합니다.

(참고로 제출하신 `[true, false]`처럼 정확히 고정하고 싶으면 `as const`를 붙입니다. `const flags = [true, false] as const` → `readonly [true, false]`. 지금은 이런 게 있다는 정도만 알아 두시면 됩니다.)

#### 보충 2 ✅ 정답

- `any`: 빨간 줄 없음 → 실행하면 💥
- `unknown`: 빨간 줄로 미리 막아 줌

정확합니다. 이제 "에러를 미리 내 주는 쪽이 안전하다"는 TypeScript의 핵심을 이해하셨습니다. **1단계 완료!** 🎉
