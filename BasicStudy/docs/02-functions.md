# 2단계: 함수 타입

### 2-1. 매개변수와 반환 타입

1단계에서 "추론할 수 없는 곳에 타입을 적는다"고 했죠. 그 대표적인 곳이 **함수 매개변수**입니다.

```ts
//                매개변수 타입    반환 타입
function add(a: number, b: number): number {
  return a + b;
}

add(1, 2);      // ✅ 3
add(1, "2");    // ❌ "2"는 number가 아님
add(1);         // ❌ 인수 2개가 필요한데 1개만 줌
add(1, 2, 3);   // ❌ 인수가 너무 많음
```

JavaScript는 인수 개수가 틀려도 그냥 실행하지만, TypeScript는 **개수까지 검사**합니다.

반환 타입(`: number`)은 생략해도 `return a + b`를 보고 추론해 줍니다. 그래도 적어 두면 실수로 엉뚱한 값을 반환할 때 잡아 주기 때문에, 중요한 함수에는 적는 편입니다.

### 2-2. 선택적 매개변수 `?`와 기본값

```ts
// ? 를 붙이면 "안 줘도 됨"
function greet(name: string, title?: string) {
  // title의 타입은 string | undefined (값이 없을 수도 있음)
  return title ? `${title} ${name}님` : `${name}님`;
}
greet("철수");          // ✅ "철수님"
greet("철수", "팀장");  // ✅ "팀장 철수님"

// 기본값을 주면 타입도 추론되고 자동으로 선택적이 됨
function power(base: number, exp = 2) {   // exp: number
  return base ** exp;
}
power(3);      // ✅ 9
power(3, 3);   // ✅ 27
```

> ⚠️ 선택적 매개변수는 **반드시 필수 매개변수 뒤에** 둡니다. `function f(a?: string, b: string)`는 에러입니다.

### 2-3. `void`: 반환값이 없는 함수

```ts
function log(message: string): void {
  console.log(message);
  // return 없음
}
```

`void`는 "이 함수는 아무것도 돌려주지 않는다"는 뜻입니다. React에서 `onClick` 같은 이벤트 함수 타입에 아주 자주 나옵니다.

### 2-4. 화살표 함수와 함수 타입

```ts
// 화살표 함수에도 똑같이 붙임
const multiply = (a: number, b: number): number => a * b;

// "함수의 모양" 자체를 타입으로 만들 수 있음
type Calc = (a: number, b: number) => number;
//           ↑ 매개변수              ↑ 반환 타입 (여기서는 => 로 표시)

const sub: Calc = (a, b) => a - b;   // a, b에 타입을 안 적어도 Calc에서 가져옴 ✅
const bad: Calc = (a, b) => "결과";  // ❌ number를 반환해야 함
```

`type Calc = ...`처럼 함수 모양을 미리 정해 두는 방식은 **7단계 React props**에서 `onClick: () => void` 형태로 다시 나옵니다.

## 🧪 2단계 연습 문제

**문제 1.** 아래 JavaScript 함수에 타입을 붙여 주세요. (매개변수와 반환 타입 모두)
```ts
function introduce(name, age) {
  return `${name}은 ${age}살입니다`;
}
```

**문제 2.** 아래 호출 중 에러가 나는 것을 모두 고르고 이유를 써 주세요.
```ts
function order(menu: string, count: number, memo?: string) {
  return `${menu} ${count}개 ${memo ?? ""}`;
}

order("커피", 2);            // (가)
order("커피");               // (나)
order("커피", 2, "얼음 많이"); // (다)
order(2, "커피");            // (라)
order("커피", 2, 100);       // (마)
```

**문제 3.** 아래 함수의 반환 타입은 무엇으로 추론될까요?
```ts
function printAll(items: string[]) {
  items.forEach(item => console.log(item));
}
```

**문제 4.** 아래 `type`을 이용해 **두 숫자 중 더 큰 값을 반환하는** 화살표 함수 `max`를 직접 작성해 주세요.
```ts
type Compare = (a: number, b: number) => number;

const max: Compare = /* 여기를 채워 주세요 */
```

막히는 문제는 "힌트"라고 보내 주세요. 💡

## ✍️ 내 답

```text
(name:string , age:number ) : string

나 : 숫자가 없음
라 : 숫자와 문자 파라미터 순서바뀜
마 : 100은 문자타입 아님

void

const max:Compare = (a, b) => a > b ? a : b;
```

## ✅ 채점·피드백 (정답 포함)

| 문제 | 채점 | 코멘트 |
|---|---|---|
| 1 | ✅ | `(name: string, age: number): string` 정확합니다 |
| 2 | ✅ | (나)·(라)·(마)를 모두 찾았고 이유도 맞습니다. (가)는 `memo`를 안 줘도 되고, (다)는 세 개 모두 맞는 타입이라 정상입니다 |
| 3 | ✅ | `void` 맞습니다. `forEach`만 하고 `return`이 없으니까요 |
| 4 | ✅ | 삼항 연산자로 깔끔하게 쓰셨습니다. `a`, `b`에 타입을 안 적어도 `Compare`에서 가져온다는 점도 잘 활용하셨어요 |

문제 2에서 하나만 더 짚으면, (마)의 에러 메시지는 이렇게 나옵니다.
```
❌ 'number' 형식의 인수는 'string' 형식의 매개변수에 할당될 수 없습니다.
```
선택적 매개변수(`memo?`)도 **값을 줄 때는 타입이 맞아야** 한다는 점까지 이해하신 겁니다. 👍

**2단계 완료!** 다음은 실무에서 가장 많이 쓰는 객체 타입입니다.
