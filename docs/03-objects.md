# 3단계: 객체 타입

### 3-1. 객체에 타입 붙이기

```ts
// 직접 붙이면 길고, 재사용도 안 됨
let user: { name: string; age: number } = { name: "철수", age: 30 };
```

그래서 보통은 **타입에 이름을 붙여** 재사용합니다. 방법이 두 가지 있습니다.

```ts
// 방법 1: type
type User = {
  name: string;
  age: number;
};

// 방법 2: interface (= 기호 없음)
interface User2 {
  name: string;
  age: number;
}

const a: User = { name: "철수", age: 30 };   // ✅ 둘 다 같은 방식으로 사용
const b: User2 = { name: "영희", age: 25 };  // ✅
```

### 3-2. 객체 검사: 빠지거나, 남거나, 틀리거나

```ts
const u1: User = { name: "철수" };                    // ❌ age가 빠짐
const u2: User = { name: "철수", age: 30, job: "개발" }; // ❌ User에 없는 job이 있음
const u3: User = { name: "철수", age: "30" };          // ❌ age는 number

u1.email;   // ❌ User에 email 속성이 없음 (오타도 이렇게 잡아 줌)
```

### 3-3. 선택 속성 `?`와 `readonly`

2단계의 선택적 매개변수와 같은 `?`를 객체 속성에도 씁니다.

```ts
type Member = {
  readonly id: number;   // 처음 만든 뒤에는 바꿀 수 없음
  name: string;
  phone?: string;        // 있어도 되고 없어도 됨 → string | undefined
};

const m: Member = { id: 1, name: "철수" };  // ✅ phone 없어도 OK

m.name = "영희";   // ✅
m.id = 2;          // ❌ 읽기 전용 속성이므로 'id'에 할당할 수 없습니다.
```

### 3-4. 객체 배열과 중첩 객체

실무에서 API 응답은 거의 이 모양입니다.

```ts
type Address = {
  city: string;
  zip: string;
};

type Customer = {
  name: string;
  address: Address;      // 객체 안에 객체
  tags: string[];        // 객체 안에 배열
};

const customers: Customer[] = [   // 객체의 배열
  { name: "철수", address: { city: "서울", zip: "04524" }, tags: ["VIP"] },
];

customers[0].address.city;   // ✅ 에디터가 자동완성까지 해 줌
```

### 3-5. 확장: 기존 타입에 속성 더하기

```ts
// interface는 extends
interface Person {
  name: string;
}
interface Employee extends Person {
  company: string;
}

// type은 & (교차 타입)
type Person2 = { name: string };
type Employee2 = Person2 & { company: string };

const e: Employee = { name: "철수", company: "A사" };  // ✅ name + company 둘 다 필요
```

### 3-6. `type`과 `interface`, 무엇을 써야 하나?

| | `type` | `interface` |
|---|---|---|
| 객체 모양 정의 | ✅ | ✅ |
| 확장 | `&` | `extends` |
| 객체 말고 다른 것도 정의 | ✅ `type Id = string \| number` 같은 것도 가능 | ❌ 객체 모양만 |

> 💡 **실무 기준**: 객체 모양은 어느 쪽이든 괜찮고, **팀에서 정한 쪽으로 통일**하면 됩니다. 이 강의에서는 4단계에서 배울 유니온까지 한 가지로 쓸 수 있는 `type`을 주로 쓰겠습니다.

## 🧪 3단계 연습 문제

**문제 1.** 아래 코드에서 에러가 나는 줄을 모두 찾고 이유를 써 주세요.
```ts
type Book = {
  readonly isbn: string;
  title: string;
  price: number;
  author?: string;
};

const b1: Book = { isbn: "111", title: "TS 입문", price: 20000 };   // (가)
const b2: Book = { isbn: "222", title: "React 입문" };              // (나)
const b3: Book = { isbn: "333", title: "JS", price: 15000, page: 300 }; // (다)

b1.price = 18000;    // (라)
b1.isbn = "999";     // (마)
b1.author = "김작가"; // (바)
```

**문제 2.** 아래 조건에 맞는 `type Product`를 작성해 주세요.
- `name`: 문자열
- `price`: 숫자
- `tags`: 문자열 배열
- `discount`: 숫자, **없어도 됨**

**문제 3.** 문제 2의 `Product`를 받아서 **최종 가격(가격 − 할인액)**을 반환하는 함수 `getFinalPrice`를 작성해 주세요. 할인이 없으면 원래 가격을 반환합니다.
> 💡 힌트: 2단계 문제 2에 나왔던 `??` 연산자를 써 보세요. `값 ?? 대신할값`은 값이 `undefined`나 `null`일 때 대신할 값을 씁니다.

**문제 4.** 아래 `Animal`을 확장해서 `bark: () => void` 속성을 가진 `Dog` 타입을 만들어 주세요. **`interface` 버전과 `type` 버전** 두 가지 모두 써 주세요.
```ts
interface Animal {
  name: string;
}
```

## ✍️ 내 답

```text
나, 넘버가 없어,
다, 페이지는 문자열값이야
마, isbn은 읽기만 가능해

type Product = {
name:string;
price: number;
tags:string[];
discount?:number;
} ;

getFinalPrice(prod:Product) : number {
return prod.price - (prod.discount ?? 0)
}

interface Dog extends Animal {
 bark: () => void
}
type Dog = Animal & { bark: () => }
```

## ✅ 채점·피드백 (정답 포함)

전체적으로 개념은 잘 잡으셨고, **작은 문법 실수 두 개와 이유 하나**만 고치면 됩니다.

### 문제 1 🔺 에러 줄은 모두 찾음, (다)의 이유가 틀림

| 줄 | 판정 | 제출한 이유 | 코멘트 |
|---|---|---|---|
| (가) | 정상 | | `author`는 `?`라서 없어도 OK |
| (나) | ❌ 에러 | 넘버가 없어 | ✅ 맞습니다. 정확히는 **`price` 속성이 없다**고 말하면 됩니다 |
| (다) | ❌ 에러 | 페이지는 문자열값이야 | ❌ **이유가 다릅니다** (아래 설명) |
| (라) | 정상 | | `price`는 바꿀 수 있음 |
| (마) | ❌ 에러 | isbn은 읽기만 가능 | ✅ 맞습니다 |
| (바) | 정상 | | 선택 속성이어도 나중에 넣을 수 있음 |

**(다)의 진짜 이유: `Book`에 `page`라는 속성 자체가 없습니다.**

```ts
const b3: Book = { isbn: "333", title: "JS", price: 15000, page: 300 };
// ❌ 개체 리터럴은 알려진 속성만 지정할 수 있으며 'Book' 형식에 'page'이(가) 없습니다.
```

`page: 300`은 숫자고 그 자체로는 문제없습니다. TypeScript가 막는 이유는 **설계도(`Book`)에 없는 속성을 넣었기 때문**입니다. 3-2에서 본 `job: "개발"` 예시와 같은 경우입니다.

> 📌 객체 에러는 세 종류만 기억하세요: **빠짐**(나), **남음**(다), **타입 틀림**

### 문제 2 ✅ 정답

```ts
type Product = {
  name: string;
  price: number;
  tags: string[];
  discount?: number;
};
```
완벽합니다.

### 문제 3 🔺 로직은 정답, `function` 키워드가 빠짐

`prod.discount ?? 0`으로 할인이 없을 때를 처리한 건 **아주 좋습니다**. 이게 이 문제의 핵심이었어요. 다만 함수 선언에는 `function`이 필요합니다.

```ts
// ❌ 제출한 코드: 문법 에러
getFinalPrice(prod: Product): number { ... }

// ✅ 수정
function getFinalPrice(prod: Product): number {
  return prod.price - (prod.discount ?? 0);
}

// ✅ 화살표 함수로 써도 됨
const getFinalPrice = (prod: Product): number => prod.price - (prod.discount ?? 0);
```

> 💡 `function` 없이 `이름(...) { }` 형태로 쓰는 건 **클래스나 객체 안의 메서드**일 때만 가능합니다. 다른 언어(Java 등)를 써 보셨다면 그 습관이 나왔을 수 있습니다.

### 문제 4 🔺 interface는 정답, type은 `void`가 빠짐

```ts
// ✅ 정답
interface Dog extends Animal {
  bark: () => void;
}

// ❌ 제출한 코드: () => 뒤에 반환 타입이 없음
type Dog = Animal & { bark: () => };

// ✅ 수정
type Dog = Animal & { bark: () => void };
```

함수 타입은 항상 **`(매개변수) => 반환타입`** 세트입니다. 반환값이 없어도 `void`를 꼭 적어야 합니다.

(참고: `Animal`은 interface인데 `type`의 `&`로 합쳐도 문제없습니다. 둘은 섞어 쓸 수 있습니다.)

**3단계 완료!** 다음 단계는 React에서 `useState`를 쓸 때 꼭 필요한 내용입니다.
