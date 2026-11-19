# 7단계: React + TypeScript 기초

### 🛠 실습 환경

React는 TypeScript Playground에서 화면을 실행할 수 없습니다. 둘 중 하나를 쓰세요.

- **설치 없이 (추천)**: https://stackblitz.com 에서 **React + TypeScript** 템플릿 선택
- **내 컴퓨터에서**: 터미널에 `npm create vite@latest my-app -- --template react-ts` → `cd my-app` → `npm install` → `npm run dev`

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

아직 풀지 않음

## ✅ 채점·피드백

아직 풀지 않음 (답을 제출하면 채점합니다)
