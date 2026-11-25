# 7단계: React + TypeScript 기초

### React Native 로 읽기 (2026-11-24 전환)

이 과정은 2026-11-24 부터 **React Native 기준**입니다(React Native 라이브 코딩 준비). 이 문서의 강의 본문은 처음에 웹 React 로 썼습니다. props·state·`map`/`key` 같은 개념은 똑같고 화면 태그와 이벤트 이름만 다르므로, 본문의 웹 태그는 아래 표로 바꿔 읽습니다.

| 하는 일 | 웹 React (본문) | React Native | Compose |
|---|---|---|---|
| 감싸는 틀 | `<div>` | `<View>` | `Column`·`Box` |
| 글자 | `<p>`·`<span>`, 버튼 글자는 태그 사이 | `<Text>` (글자는 **반드시** `Text` 안) | `Text("...")` |
| 버튼 | `<button onClick={f}>토글</button>` | `<Pressable onPress={f}><Text>토글</Text></Pressable>` | `Button(onClick = f) { Text("토글") }` |
| 입력창 | `<input value={v} onChange={(e) => setV(e.target.value)} />` | `<TextInput value={v} onChangeText={(text) => setV(text)} />` | `TextField(value = v, onValueChange = { v = it })` |
| 목록 | `<ul>` 안에 `<li key={...}>` | `<View>` 안에서 `map`, 가장 바깥 요소에 `key` (긴 목록은 `FlatList`) | `Column` (긴 목록은 `LazyColumn`) |
| 누름 이벤트 타입 | `React.MouseEvent<HTMLButtonElement>` | `GestureResponderEvent` | - |
| 가져오기 | 소문자 태그는 `import` 없이 씀 | `import { View, Text, Pressable, TextInput } from "react-native";` | `import androidx.compose...` |

### 🛠 실습 환경

React Native 는 TypeScript Playground 에서 화면을 실행할 수 없습니다.

- **설치 없이 (추천)**: https://snack.expo.dev 에서 바로 작성 (브라우저 안에 휴대폰 화면 미리보기가 나옵니다). 기본 파일 `App.js` 를 **`App.tsx`** 로 이름을 바꿔야 TypeScript 문법이 동작합니다
- **내 컴퓨터에서**: 터미널에 `npx create-expo-app@latest my-app` → `cd my-app` → `npx expo start`
- 본문의 웹 React 예제를 그대로 돌려 볼 때: https://stackblitz.com 의 **React + TypeScript** 템플릿, 또는 `npm create vite@latest my-app -- --template react-ts` → `cd my-app` → `npm install` → `npm run dev`

> 파일 확장자는 `.ts`가 아니라 **`.tsx`**입니다. JSX(HTML처럼 생긴 문법)를 쓰는 파일은 `.tsx`를 씁니다.

### 7-1. 컴포넌트 = JSX를 반환하는 함수

```tsx
function Hello() {
  return <h1>안녕하세요</h1>;
}

// 사용할 때는 HTML 태그처럼
<Hello />
```

컴포넌트 이름은 **반드시 대문자로 시작**합니다. (`hello`라고 쓰면 HTML 태그로 착각합니다)

### 7-2. props에 타입 붙이기 ⭐ 가장 중요

props는 **컴포넌트에 전달하는 값**입니다. 3단계 객체 타입 그대로 씁니다.

```tsx
type GreetingProps = {
  name: string;
  age?: number;      // 선택 props
};

//                ↓ 구조 분해로 바로 꺼냄  ↓ props 타입
function Greeting({ name, age }: GreetingProps) {
  return (
    <p>
      {name}님 {age && `(${age}살)`}
    </p>
  );
}
```

사용할 때 TypeScript가 3단계와 똑같이 검사합니다.

```tsx
<Greeting name="철수" />              // ✅
<Greeting name="철수" age={30} />     // ✅ 숫자는 { } 안에
<Greeting />                          // ❌ name이 빠짐
<Greeting name="철수" age="30" />     // ❌ "30"은 string
<Greeting name="철수" job="개발" />   // ❌ GreetingProps에 job 없음
```

> 💡 JSX에서 문자열은 `"철수"`, **그 밖의 값(숫자·boolean·변수·함수)은 `{ }`** 안에 넣습니다.

기본값은 구조 분해에서 줍니다: `function Greeting({ name, age = 20 }: GreetingProps)`

### 7-3. 함수 props: 이벤트를 부모에게 알리기

2단계의 함수 타입이 여기서 쓰입니다.

```tsx
type ButtonProps = {
  label: string;
  onClick: () => void;              // 클릭됐다고 알려 주는 함수
};

function MyButton({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// 부모에서 사용
<MyButton label="저장" onClick={() => console.log("저장 클릭")} />
```

값을 함께 넘길 수도 있습니다.

```tsx
type ItemProps = {
  id: number;
  onDelete: (id: number) => void;   // 어떤 id를 지울지 알려 줌
};

function Item({ id, onDelete }: ItemProps) {
  return <button onClick={() => onDelete(id)}>삭제</button>;
}
```

### 7-4. children: 태그 사이에 넣는 내용

```tsx
type CardProps = {
  title: string;
  children: React.ReactNode;   // JSX, 문자열, 숫자 등 화면에 그릴 수 있는 모든 것
};

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

<Card title="공지">
  <p>내일은 휴무입니다</p>     {/* ← 이 부분이 children */}
</Card>
```

### 7-5. 이벤트 타입: 다시 제네릭

입력창 값을 읽을 때 이벤트 객체 `e`에 타입이 필요합니다.

```tsx
function SearchBox() {
  //                    ↓ 5단계 제네릭: "input 태그에서 일어난 change 이벤트"
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);   // ✅ string
  };
  return <input onChange={handleChange} />;
}
```

외울 필요는 없습니다. **`onChange={(e) => ...}`처럼 JSX 안에 바로 쓰면 타입이 자동으로 추론**됩니다. 함수를 밖으로 뺄 때만 적으면 되고, 그때는 `e`에 마우스를 올려 나온 타입을 복사해 쓰면 됩니다.

| 이벤트 | 타입 |
|---|---|
| input 값 변경 | `React.ChangeEvent<HTMLInputElement>` |
| 버튼 클릭 | `React.MouseEvent<HTMLButtonElement>` |
| form 제출 | `React.FormEvent<HTMLFormElement>` |

### 7-6. 목록 그리기: `map`과 `key`

```tsx
type User = { id: number; name: string };

function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>   // key: React가 항목을 구별하는 고유값
      ))}
    </ul>
  );
}
```

## 🧪 7단계 연습 문제

**문제 1.** 아래 컴포넌트를 사용할 때 에러가 나는 것을 모두 고르고 이유를 써 주세요.
```tsx
type BadgeProps = {
  text: string;
  count?: number;
  onClick: () => void;
};

<Badge text="알림" onClick={() => {}} />                  // (가)
<Badge text="알림" count="5" onClick={() => {}} />        // (나)
<Badge count={5} onClick={() => {}} />                    // (다)
<Badge text="알림" count={5} />                           // (라)
```

**문제 2.** 아래 조건에 맞는 `Profile` 컴포넌트를 작성해 주세요. (props 타입 포함)
- `name`(문자열), `age`(숫자)를 받음
- `isAdmin`(boolean)은 **선택**이고, `true`이면 이름 옆에 `"(관리자)"`를 표시

**문제 3.** 아래처럼 사용할 수 있는 `TodoItem` 컴포넌트와 props 타입을 작성해 주세요. 체크박스 대신 버튼을 누르면 `onToggle`에 자신의 `id`를 넘깁니다.
```tsx
<TodoItem id={1} title="TS 공부" done={false} onToggle={(id) => console.log(id)} />
```

**문제 4.** `products` 배열을 받아 `"상품명 - 가격원"` 형태로 목록을 그리는 `ProductList` 컴포넌트를 작성해 주세요. (`key` 포함)
```tsx
type Product = { id: number; name: string; price: number };
```

## ✍️ 내 답

> 강의는 2026-11-20 에 Compose 와 나란히 비교하는 방식으로 다시 진행한 뒤 풀었습니다. 그때 추가로 설명한 내용: 조건에 따라 보여 주기(`{조건 && 화면}`, `{조건 ? A : B}`), 숫자에 `&&` 를 쓰면 `0` 이 찍히는 함정, `onClick={onDelete(id)}` 처럼 쓰면 그리는 순간 바로 호출되는 실수.

```text
1. 나 : 카운트는 넘버야, 다: 텍스트없고, 카운트는 넘버야, 라: 카운트는 넘버야.
```

```tsx
// 문제 2
export function Profile( {name:string, age:number, isAdmin?:boolean}) {
  return (
    <View>
      <Text>
        이름 : {name} (isAdmin && <Text>관리자</Text>)
      </Text>
    </View>
  )
}

// 문제 3
function TodoItem(id:number, title:String, done:boolean, onToggle:(id:string)=>void)

// 문제 4
function ProductList(products:product[]) {
  return (
    <ul>
      {products.map( product => <li key={product.id}> {product.name} - {product.price}원 </li> )}}
    </ul>
  )
}
```

## ✅ 채점·피드백 (정답 포함)

> **가장 큰 공통 실수**: 문제 2·3·4 모두 **props 를 받는 모양**이 틀렸습니다. Compose 처럼 파라미터를 하나씩 받거나, 구조 분해 안에 타입을 적었습니다. 아래 핵심 두 가지를 먼저 보세요.

### 핵심 1: React 는 props 를 객체 하나로 넘깁니다

```tsx
<TodoItem id={1} title="TS 공부" />

// React 가 실제로 하는 일
TodoItem({ id: 1, title: "TS 공부" });   // 인자는 언제나 객체 1개
```

| | 부르는 모양 | 받는 쪽 |
|---|---|---|
| Compose | `TodoItem(id = 1, title = "TS 공부")` | 파라미터 2개: `fun TodoItem(id: Int, title: String)` |
| React | `TodoItem({ id: 1, title: "TS 공부" })` | 객체 1개: `function TodoItem({ id, title }: TodoItemProps)` |

그래서 `function TodoItem(id: number, title: string)` 처럼 받으면 `id` 에 **props 객체 전체**가 들어가고 `title` 은 비어 있습니다.

### 핵심 2: 구조 분해 `{ }` 안의 `:` 은 타입이 아니라 "이름 바꾸기"입니다

| 쓴 것 | TypeScript 가 읽는 뜻 |
|---|---|
| `({ name: string })` | `name` 값을 꺼내서 **`string` 이라는 이름의 변수**에 넣어라 (타입 아님) |
| `({ name }: { name: string })` | `name` 값을 꺼내라. 들어오는 객체의 타입은 `{ name: string }` |

Kotlin 은 `name: String` 처럼 파라미터마다 타입을 붙이지만, TypeScript 구조 분해에서는 **`}` 를 닫은 뒤에 객체 전체의 타입**을 한 번에 붙입니다. 그래서 보통 `type XxxProps = { ... }` 를 따로 만들어 `}: XxxProps` 로 붙입니다.

### 문제 1 🔺 에러 줄은 모두 찾음, (라)의 이유가 틀림

| 줄 | 결과 | 이유 |
|---|---|---|
| (가) | 에러 없음 (고르지 않음, 정답) | `count` 는 `?` 라서 빼도 되고, `text`·`onClick` 은 있음 |
| (나) | 에러 (정답) | `"5"` 는 문자열인데 `count` 는 `number` |
| (다) | 에러 (정답) | 꼭 필요한 `text` 가 빠짐. `count={5}` 는 숫자를 `{ }` 에 넣은 올바른 모양 |
| (라) | 에러 (고른 건 정답, 이유 오답) | `count={5}` 는 문제없음. 진짜 이유는 **`onClick` 이 빠짐** |

`BadgeProps` 에서 `onClick` 에는 `?` 가 없습니다. **함수 props 도 `?` 가 없으면 필수**입니다. Kotlin 으로 치면 기본값 없는 `onClick: () -> Unit` 파라미터를 넘기지 않은 것과 같습니다.

```
Property 'onClick' is missing in type '{ text: string; count: number; }' but required in type 'BadgeProps'.
```

### 문제 2 ❌ 구조 분해 안에 타입을 적었고, `( )` 로 감싸서 조건이 동작하지 않음

1. **`{name:string, age:number, isAdmin?:boolean}`**: 핵심 2 의 함정입니다. `name`·`age` 라는 변수는 생기지 않고 `string`·`number` 라는 이름의 변수가 생깁니다. `isAdmin?:` 은 문법 에러입니다.
2. **`(isAdmin && <Text>관리자</Text>)`**: JSX 안에서 괄호 `( )` 는 **그냥 글자**입니다. 화면에는 조건과 상관없이 `이름 : 철수 (isAdmin && 관리자)` 가 그대로 나옵니다. JavaScript 코드를 실행하려면 **중괄호 `{ }`** 로 감싸야 합니다.
3. **`View`·`Text`**: React Native 기준으로 맞습니다. 파일 위에 `import { View, Text } from "react-native";` 만 있으면 됩니다. (2026-11-24 RN 기준으로 다시 봤습니다. 처음 채점은 웹 기준이라 `div`·`p` 를 쓰라고 했습니다.)

```tsx
// ✅ 정답
type ProfileProps = {
  name: string;
  age: number;
  isAdmin?: boolean;
};

function Profile({ name, age, isAdmin }: ProfileProps) {
  return (
    <p>
      {name}{isAdmin && " (관리자)"}, {age}살
    </p>
  );
}

// <Profile name="철수" age={30} isAdmin={true} />  → 철수 (관리자), 30살
// <Profile name="영희" age={25} />                 → 영희, 25살
```

```tsx
// ✅ React Native 정답 (props 부분은 같고, 글자를 <Text> 로 감쌈)
import { Text } from "react-native";

function Profile({ name, age, isAdmin }: ProfileProps) {
  return (
    <Text>
      {name}{isAdmin && " (관리자)"}, {age}살
    </Text>
  );
}
```

### 문제 3 ❌ 미완성: props 를 파라미터 여러 개로 받았고 본문이 없음

1. props 를 파라미터 4개로 받았습니다 → 핵심 1 대로 객체 하나로 받아야 합니다.
2. `title:String` → TypeScript 는 소문자 **`string`** 입니다. 대문자 `String` 은 다른 타입(포장 객체 타입)이라 쓰지 않습니다. Java·Kotlin 습관입니다.
3. `onToggle:(id:string)=>void` → `id` 는 숫자이므로 `(id: number) => void` 여야 합니다. 이대로면 안에서 `onToggle(id)` 를 부를 때 "number 를 string 자리에 넣을 수 없다" 에러가 납니다.
4. 함수 본문(`{ return ( ... ) }`)이 없어서 버튼이 그려지지 않습니다.

정답은 아래 보충 문제 1 에서 재도전한 뒤 공개합니다.

### 문제 4 🔺 `map`·`key`·표시 형식은 정답, props 받는 모양과 오타 2곳

`products.map(product => <li key={product.id}>{product.name} - {product.price}원</li>)` 부분은 정확합니다. 목록 그리기의 핵심은 잡혔습니다.

1. **`(products: product[])`**: 핵심 1 의 함정입니다. React 는 `ProductList({ products: [...] })` 로 부르므로 변수 `products` 에 배열이 아니라 **props 객체**가 들어갑니다. 객체에는 `.map` 이 없어서 실행하면 `products.map is not a function` 에러가 납니다. TypeScript 는 쓰는 쪽 `<ProductList products={list} />` 에 빨간 줄을 칩니다.
2. **`product[]`**: 타입 이름은 대문자 `Product` 입니다. 대소문자를 구별하므로 `product` 라는 타입은 없다는 에러가 납니다.
3. **`)}}`**: 닫는 `}` 가 하나 더 있습니다. JSX 안에서 `}` 가 혼자 나오면 에러입니다.

```tsx
// ✅ 정답
type Product = { id: number; name: string; price: number };

function ProductList({ products }: { products: Product[] }) {
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          {product.name} - {product.price}원
        </li>
      ))}
    </ul>
  );
}
```

## 🔁 보충 문제 (헷갈린 부분 재확인)

**보충 1.** 문제 3 `TodoItem` 재도전입니다. 아래 조건을 모두 지켜 주세요.

```tsx
<TodoItem id={1} title="TS 공부" done={true} onToggle={(id) => console.log(id)} />
// 화면: TS 공부 (완료) [토글]
```

- props 타입 `TodoItemProps` 를 따로 만듭니다.
- `title` 을 보여 주고, `done` 이 `true` 면 제목 옆에 `" (완료)"` 를 표시합니다.
- "토글" 버튼을 누르면 `onToggle` 에 자기 `id` 를 넘깁니다.

> 💡 참고: 위 문제 2 정답(`Profile`)의 props 받는 모양 + 강의 7-3 의 `Item` (`onClick={() => onDelete(id)}`)

**보충 2.** `count` 가 `3` 일 때 (가)·(나) 각각 화면에 어떤 글자가 나오나요?

```tsx
<p>합계 (count * 2)개</p>     // (가)
<p>합계 {count * 2}개</p>     // (나)
```

### 보충 문제: 내 답

```tsx
// 보충 1
type TodoItemProps = {
  id:number;
  title:string;
  done:boolean;
  onToggle:(id:number) => void;
}

function TodoItem({id, title, done, onToggle}:TodoItemProps) {
  return (
    <View>
    <Text>{title}{done && "(완료)"}</Text>
    <Button onclick={()=>onToggle(id)}>
      <Text>토글</Text>
    </Button>
    </View>
  );
}
```

```text
보충 2
(가) 합계 (3 * 2)개
(나) 합계 6개
```

### 보충 문제: 채점·피드백 (정답 포함)

#### 보충 1 🔺 props 받는 모양·조건 표시·함수 props 모두 정답, 버튼 한 줄만 고침

본 문제에서 틀렸던 세 가지가 모두 고쳐졌습니다.

| 본 문제에서 틀린 것 | 보충 1 |
|---|---|
| props 를 파라미터 여러 개로 받음 | ✅ `({ id, title, done, onToggle }: TodoItemProps)` 객체 하나로 받음 |
| 구조 분해 안에 타입을 적음 | ✅ 타입을 `}` 뒤에 붙임 |
| 조건을 `( )` 로 감쌈 | ✅ `{done && "(완료)"}` 중괄호 사용 |
| `onToggle` 의 `id` 를 `string` 으로 씀 | ✅ `(id: number) => void` |
| (함수 props) | ✅ `() => onToggle(id)` 로 감싸서 넘김 |

고칠 곳은 버튼 한 줄입니다. (2026-11-24 React Native 기준으로 다시 채점했습니다. 처음 채점은 웹 기준이라 `onclick` → `onClick` 하나만 고치라고 했습니다.)

1. **`onclick` → `onPress`**: 이벤트 이름은 camelCase 입니다. 소문자 `onclick` 은 웹에서도 RN 에서도 에러입니다. React Native 는 누름을 `onPress` 로 받습니다(웹은 `onClick`).
2. **`Button` → `Pressable`**: `View`·`Text` 를 쓰고 버튼 안에 `<Text>토글</Text>` 을 넣은 모양은 RN 에서 맞습니다. 다만 RN 의 `Button` 은 글자를 `title` 로만 받고 안쪽 내용(children)을 받지 않습니다. 안에 `Text` 를 넣는 버튼은 `Pressable` 로 씁니다.

`<Button onClick={...}><Text>토글</Text></Button>` 은 Compose 의 `Button(onClick = { ... }) { Text("토글") }` 모양을 옮긴 것으로 보입니다. RN 에서 그 모양 그대로 쓰는 컴포넌트가 `Pressable` 입니다.

| 환경 | 버튼 쓰는 법 |
|---|---|
| React Native `Pressable` (이 과정) | `<Pressable onPress={() => onToggle(id)}><Text>토글</Text></Pressable>` — Compose `Button(onClick) { Text() }` 와 같은 모양 |
| React Native `Button` | `<Button title="토글" onPress={() => onToggle(id)} />` — 글자는 `title`, 모양은 못 바꿈 |
| 웹 React | `<button onClick={() => onToggle(id)}>토글</button>` — 소문자 `button`, 글자는 태그 사이 |

사소한 점: 조건은 `" (완료)"` 였는데 앞 공백이 빠져 `TS 공부(완료)` 로 붙어 나옵니다. 감점은 아닙니다.

```tsx
// 웹 React 정답 (8단계 문제 4 에서 <ul> 안에 넣어 쓰도록 <li> 로 감쌈)
type TodoItemProps = {
  id: number;
  title: string;
  done: boolean;
  onToggle: (id: number) => void;
};

function TodoItem({ id, title, done, onToggle }: TodoItemProps) {
  return (
    <li>
      {title}{done && " (완료)"}
      <button onClick={() => onToggle(id)}>토글</button>
    </li>
  );
}
```

```tsx
// ✅ React Native 정답 (TodoItemProps 는 위와 같음)
import { View, Text, Pressable } from "react-native";

function TodoItem({ id, title, done, onToggle }: TodoItemProps) {
  return (
    <View>
      <Text>{title}{done && " (완료)"}</Text>
      <Pressable onPress={() => onToggle(id)}>
        <Text>토글</Text>
      </Pressable>
    </View>
  );
}
```

#### 보충 2 🔺 (나) 정답, (가)는 변수 이름도 글자 그대로 나옴

- (나) `합계 6개` ✅ 정답입니다.
- (가) 정답은 `합계 (count * 2)개` 입니다. `( )` 안은 계산만 안 되는 것이 아니라 **`count` 라는 변수 이름도 값으로 바뀌지 않습니다.** `{ }` 밖은 전부 글자 그대로입니다.

Kotlin 문자열 템플릿과 똑같습니다. JSX 의 `{ }` 는 Kotlin 의 `${ }` 입니다.

| Kotlin | 결과 | JSX | 결과 |
|---|---|---|---|
| `"합계 (count * 2)개"` | 합계 (count * 2)개 | `<p>합계 (count * 2)개</p>` | 합계 (count * 2)개 |
| `"합계 ${count * 2}개"` | 합계 6개 | `<p>합계 {count * 2}개</p>` | 합계 6개 |

**7단계 완료!** props 를 객체 하나로 받는 모양이 잡혔습니다. 다음은 8단계 `useState` 입니다.
