# 8단계: useState

> Android(Compose) 개발자 기준으로 `remember { mutableStateOf() }` 와 나란히 비교합니다.

### React Native 로 읽기 (2026-11-24 전환)

이 과정은 2026-11-24 부터 **React Native 기준**입니다. 아래 강의 본문은 처음에 웹 React 로 썼습니다. `useState`·`prev`·새 배열 만들기는 웹과 RN 이 똑같고, 화면 태그와 이벤트 이름만 아래 표로 바꿔 읽습니다.

| 하는 일 | 웹 React (본문) | React Native | Compose |
|---|---|---|---|
| 감싸는 틀 | `<div>` | `<View>` | `Column`·`Box` |
| 글자 | `<p>`·`<span>`, 버튼 글자는 태그 사이 | `<Text>` (글자는 **반드시** `Text` 안) | `Text("...")` |
| 버튼 | `<button onClick={f}>+1</button>` | `<Pressable onPress={f}><Text>+1</Text></Pressable>` | `Button(onClick = f) { Text("+1") }` |
| 입력창 | `<input value={v} onChange={(e) => setV(e.target.value)} />` | `<TextInput value={v} onChangeText={(text) => setV(text)} />` | `TextField(value = v, onValueChange = { v = it })` |
| 목록 | `<ul>` 안에 `<li key={...}>` | `<View>` 안에서 `map`, 가장 바깥 요소에 `key` (긴 목록은 `FlatList`) | `Column` (긴 목록은 `LazyColumn`) |

RN 의 `onChangeText` 는 이벤트 객체 대신 **입력된 글자를 바로** 넘겨 줍니다. 웹의 `e.target.value` 를 꺼낼 필요가 없어서 Compose 의 `onValueChange = { v = it }` 와 더 비슷합니다.

### 시작 전에

`useState` 는 React 에서, 화면 컴포넌트는 `react-native` 에서 가져와 씁니다. 파일 맨 위에 넣습니다.

```tsx
import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
```

### 8-1. 왜 일반 변수로는 안 되나

```tsx
function Counter() {
  let count = 0;
  return (
    <button onClick={() => { count++; console.log(count); }}>
      {count}
    </button>
  );
}
```

누를 때마다 콘솔에는 1, 2, 3 이 찍히지만 **화면은 계속 0** 입니다.

- React 는 "값이 바뀌었으니 다시 그려야 한다"는 사실을 모릅니다.
- 설령 다시 그려도 함수가 처음부터 다시 실행되면서 `let count = 0` 으로 돌아갑니다.

Compose 도 같습니다. Composable 안의 `var count = 0` 은 화면을 바꾸지 못해서 `remember { mutableStateOf(0) }` 를 씁니다. React 에서 그 역할을 하는 것이 `useState` 입니다.

### 8-2. useState 기본 ⭐

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  //     ↑ 현재 값  ↑ 바꾸는 함수      ↑ 처음 값
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

```kotlin
// Compose: 모양까지 거의 같습니다
val (count, setCount) = remember { mutableStateOf(0) }
Button(onClick = { setCount(count + 1) }) { Text("$count") }
```

- `setCount(새 값)` 을 부르면 React 가 컴포넌트 함수를 **처음부터 다시 실행**해서 화면을 다시 그립니다(re-render). Compose 의 recomposition 과 같습니다.
- 다시 실행되어도 `useState` 값은 `remember` 처럼 유지됩니다. `useState(0)` 의 `0` 은 맨 처음 한 번만 쓰입니다.
- `count = 5` 처럼 직접 대입할 수 없습니다. 반드시 `setCount(5)` 로 바꿉니다.
- `[count, setCount]` 는 **배열 구조 분해**입니다. 7단계 props 의 `{ name }` 은 **이름으로** 꺼냈고, 여기 `[ ]` 는 **순서로** 꺼냅니다. 그래서 이름은 자유롭게 지어도 됩니다(`[n, setN]`). 관례는 `[값, set값]` 입니다.
- `useState` 는 컴포넌트 함수의 맨 위에서만 부릅니다. `if`·`for` 안에서 부르면 안 됩니다(React 가 호출 순서로 상태를 구별합니다).

### 8-3. 상태의 타입: 대부분 추론, 가끔 제네릭

```tsx
const [count, setCount] = useState(0);        // number
const [name, setName] = useState("");         // string
const [open, setOpen] = useState(false);      // boolean
```

처음 값만 보고는 타입을 알 수 없을 때 **5단계 제네릭**으로 알려 줍니다.

```tsx
type User = { id: number; name: string };

const [user, setUser] = useState<User | null>(null);   // 처음엔 없고 나중에 들어올 값
const [tags, setTags] = useState<string[]>([]);         // 빈 배열로 시작
```

제네릭을 빼면 이렇게 됩니다.

| 쓴 것 | 추론된 타입 | 문제 |
|---|---|---|
| `useState(null)` | `null` | `null` 만 넣을 수 있는 상태가 되어 `setUser({ id: 1, name: "철수" })` 가 에러 |
| `useState([])` | `never[]` | 아무것도 넣을 수 없는 배열이 됨 |

Kotlin 에서 `mutableStateOf<User?>(null)`, `mutableStateOf(listOf<String>())` 처럼 타입을 적는 것과 같은 이유입니다.

### 8-4. 이전 값으로 계산할 때: `prev => ...` ⭐ Compose 와 다른 부분

```tsx
const handleClick = () => {
  setCount(count + 1);
  setCount(count + 1);
};
```

`count` 가 0 일 때 누르면 2 가 아니라 **1** 이 됩니다.

- `count` 는 **이번에 그릴 때의 값(스냅샷)** 입니다. 핸들러 안에서 `setCount` 를 불러도 `count` 변수 자체는 바로 바뀌지 않습니다.
- 그래서 두 줄 모두 `setCount(0 + 1)` 이 됩니다. 바뀐 값은 **다음 그리기** 때 보입니다.
- Compose 도 8-2 의 `val (count, setCount) = remember { mutableStateOf(0) }` 모양이면 `count` 가 고정된 `val` 이라 똑같이 1 입니다. `var count by remember { mutableStateOf(0) }` 로 쓰고 `count++` 를 두 번 할 때만 바로 반영되어 2 가 됩니다. React 의 `count` 는 언제나 앞쪽(`val`)처럼 동작한다고 기억하세요.

이전 값을 기준으로 바꿀 때는 **값 대신 함수**를 넘깁니다.

```tsx
setCount(prev => prev + 1);   // "지금 값이 무엇이든 거기에 +1"
setCount(prev => prev + 1);   // → 2
```

| 경우 | 모양 |
|---|---|
| 새 값이 정해져 있을 때 | `setCount(0)` |
| 이전 값으로 계산할 때 | `setCount(prev => prev + 1)` |

### 8-5. 객체·배열 상태는 새로 만들어서 넣기 ⭐

```tsx
type Todo = { id: number; title: string; done: boolean };
const [todos, setTodos] = useState<Todo[]>([]);

// ❌ 화면이 안 바뀜
todos.push(newTodo);
setTodos(todos);          // 같은 배열을 다시 넣음 → React: "같은 거네" → 다시 안 그림

// ✅ 새 배열을 만들어서 넣음
setTodos([...todos, newTodo]);
```

React 는 **같은 배열·객체인지(주소)** 로 바뀌었는지를 판단합니다. 안을 고쳐도 같은 배열이면 안 바뀐 것으로 봅니다.

Compose 도 같습니다. `mutableStateOf(listOf())` 에 든 리스트 안을 고치면 recomposition 이 일어나지 않아서 `todos = todos + newTodo` 처럼 새 리스트를 넣습니다.

`...` 은 **spread(펼치기)** 문법입니다. 기존 항목을 그대로 펼쳐서 새 배열·객체에 넣습니다.

| 하고 싶은 일 | React (새로 만들기) | Kotlin 에서 비슷한 것 |
|---|---|---|
| 추가 | `[...todos, newTodo]` | `todos + newTodo` |
| 삭제 | `todos.filter(t => t.id !== id)` | `todos.filter { it.id != id }` |
| 하나만 수정 | `todos.map(t => t.id === id ? { ...t, title: "새 제목" } : t)` | `todos.map { if (it.id == id) it.copy(title = "새 제목") else it }` |
| 객체 필드 하나 수정 | `{ ...user, name: "영희" }` | `user.copy(name = "영희")` |

- `{ ...t, title: "새 제목" }` 은 `t` 의 모든 필드를 복사하고 `title` 만 덮어씁니다. Kotlin 의 `copy` 와 같습니다.
- JavaScript 는 같은지 비교할 때 `===`, 다른지는 `!==` 를 씁니다(`==` 는 타입을 바꿔 가며 비교해서 쓰지 않습니다).
- `조건 ? A : B` 는 Kotlin 의 `if (조건) A else B` 식과 같습니다.

### 8-6. 입력창과 연결하기

```tsx
function NameInput() {
  const [name, setName] = useState("");
  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <p>안녕하세요, {name}님</p>
    </div>
  );
}
```

```kotlin
// Compose
var name by remember { mutableStateOf("") }
TextField(value = name, onValueChange = { name = it })
Text("안녕하세요, ${name}님")
```

입력창에 보이는 값(`value`)은 상태에서 오고, 글자를 치면 `onChange` 에서 상태를 바꿉니다. Compose 의 `TextField(value, onValueChange)` 와 같은 구조입니다. `onChange` 를 JSX 안에 바로 썼으므로 `e` 의 타입은 7단계에서 배운 대로 자동으로 추론됩니다.

## 🧪 8단계 연습 문제

**문제 1.** 아래 상태들을 보고 답해 주세요.
```tsx
type User = { id: number; name: string };

const [a, setA] = useState(10);
const [b, setB] = useState("hello");
const [c, setC] = useState<User | null>(null);
const [d, setD] = useState(null);
```
(1) `a`·`b`·`c`·`d` 의 타입은 각각 무엇인가요?
(2) 아래 중 에러가 나는 줄을 모두 고르고 이유를 써 주세요.
```tsx
setA("20");                       // (가)
setC({ id: 1, name: "철수" });     // (나)
setD({ id: 1, name: "철수" });     // (다)
setC(null);                       // (라)
```

**문제 2.** `count` 가 `0` 일 때 버튼을 한 번 누르면 화면의 숫자는 몇이 되나요? 그리고 한 번 누를 때 **3** 이 오르도록 고쳐 주세요. (세 줄은 그대로 두고 고치기)
```tsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
};
```

**문제 3.** 아래 조건에 맞는 `Counter` 컴포넌트를 작성해 주세요.
- 현재 숫자를 보여 줍니다 (처음 값 0)
- "+1" 버튼을 누르면 1 증가
- "초기화" 버튼을 누르면 0 으로

**문제 4.** 7단계 보충 1 의 `TodoItem` 을 써서 할 일 목록을 완성해 주세요. 토글 버튼을 누르면 그 항목의 `done` 이 뒤집혀야 합니다.
```tsx
type Todo = { id: number; title: string; done: boolean };

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, title: "TS 공부", done: false },
    { id: 2, title: "React 공부", done: false },
  ]);

  const handleToggle = (id: number) => {
    // (A) 여기를 채워 주세요: id 가 같은 항목의 done 을 뒤집은 새 배열로 setTodos
  };

  return (
    <ul>
      {/* (B) 여기를 채워 주세요: todos 를 map 해서 TodoItem 으로 그리기 (key 포함) */}
    </ul>
  );
}
```
> 💡 힌트: (A) 는 8-5 표의 "하나만 수정" 에서 `title` 대신 `done` 을 뒤집으면 됩니다(`!t.done`). (B) 의 `key` 는 `map` 안에서 가장 바깥에 있는 `<TodoItem key={...} />` 에 붙입니다. `TodoItemProps` 에 `key` 를 넣을 필요는 없습니다(React 가 따로 챙깁니다).

## ✍️ 내 답

```text
1-1. a:number , b:string , c:User? , d:null
1-2 가:넘버타입아님, 다 : User타입 아님

2. 2가 됨
```

```tsx
// 문제 2 (고친 코드)
setCount((prev) => prev + 1);
setCount((prev) => prev + 1);
setCount((prev) => prev + 1);

// 문제 3
function Counter() {
    const [num,setNum] = useState(0);

    return (
        <View>
            <Text>현재숫자 {num}</Text>
            <Buttom onClick={() => {setNum((prev) => prev+1)}}>
                <Text> +1 </Text>
            </Button>

            <Buttom onClick={() => {setNum(0)}}>
                <Text> 초기화 </Text>
            </Button>
        </View>

    )
}

// 문제 4
const handleToggle = (id: number) => {
 setTodos[...todos, todos.map( todo => todo.id === id ? {...todo, done:!todo.done} : todo)]
};


return(
    <ul>
        todos.map( todo =>
            <li key={todo.id}>
                <Text>{todo.title}</Text>
            </li>
        )
    </ul>
)
```

## ✅ 채점·피드백 (정답 포함)

### 핵심: React Native 화면은 `react-native` 에서 가져온 컴포넌트로 그립니다

> 2026-11-24 에 React Native 기준으로 다시 채점했습니다. 처음 채점은 웹 React 기준이라 `View`·`Text` 를 틀렸다고 봤는데, RN 에서는 맞는 태그입니다.

| 하는 일 | React Native | 쓰는 법 |
|---|---|---|
| 감싸는 틀 | `View` | `<View>...</View>` |
| 글자 | `Text` | 글자는 **반드시** `<Text>` 안에 씁니다 |
| 누르는 영역(버튼) | `Pressable` | `<Pressable onPress={...}><Text>+1</Text></Pressable>` |
| 입력창 | `TextInput` | `<TextInput value={v} onChangeText={(text) => setV(text)} />` |

- 모두 `import { View, Text, Pressable, TextInput } from "react-native";` 로 가져옵니다. 웹의 소문자 태그(`div`·`p`·`button`·`ul`·`li`·`input`)는 RN 에 없습니다.
- 대문자 태그는 RN 이 준 컴포넌트이거나 직접 만든 컴포넌트(`<TodoItem />`)입니다. 어느 쪽이든 `import` 했거나 같은 파일에 만들어 둔 이름이어야 합니다.
- 글자를 `<Text>` 밖에 두면 실행할 때 `Text strings must be rendered within a <Text> component.` 에러가 납니다(RN 버전에 따라 빨간 에러 화면이 뜨거나 에러 로그가 찍힙니다). TypeScript 는 이 실수를 잡지 못하므로 직접 챙겨야 합니다.
- 같은 이유로 `<View>{count && <Text>...</Text>}</View>` 에서 `count` 가 `0` 이면, 웹은 화면에 `0` 이 찍히는 데서 끝나지만 RN 은 `0` 이 `Text` 밖 글자가 되어 위 에러가 납니다. 숫자 조건은 `count > 0 && ...` 로 씁니다.
- RN 에도 `Button` 이 있지만 글자를 `title` 로만 받고(`<Button title="+1" onPress={...} />`) 안쪽에 `Text` 를 넣을 수 없습니다. Compose 의 `Button(onClick) { Text() }` 처럼 안에 `Text` 를 넣는 모양은 `Pressable` 로 씁니다.

### 문제 1 🔺 타입과 에러 줄은 모두 정답, c 의 표기와 (다)의 이유만 보충

(1) 타입

| 변수 | 내 답 | 정답 | 판정 |
|---|---|---|---|
| `a` | number | `number` | 정답 |
| `b` | string | `string` | 정답 |
| `c` | User? | `User \| null` | 뜻은 정답. `User?` 는 Kotlin 표기이고 TypeScript 는 `User \| null` 로 씁니다 |
| `d` | null | `null` | 정답 |

TypeScript 의 `?` 는 `name?: string` 처럼 **속성·파라미터 이름 뒤**에 붙어 "없어도 됨"을 뜻합니다. 타입 뒤에 붙여 null 가능 타입을 만드는 문법은 없습니다.

(2) 에러 나는 줄

| 줄 | 결과 | 판정 |
|---|---|---|
| (가) `setA("20")` | 에러 | 고른 것·이유 정답. `a` 는 `number` 인데 문자열을 넣음 |
| (나) | 에러 없음 | 고르지 않음, 정답 |
| (다) `setD({ ... })` | 에러 | 고른 것 정답, 이유 보충. 정확한 이유는 **`d` 의 타입이 `null` 로 정해져서 `null` 말고는 아무것도 넣을 수 없음** 입니다. 처음 값 `null` 만 보고 타입을 정했기 때문이고, 그래서 `c` 처럼 `useState<User \| null>(null)` 로 알려 줘야 합니다 |
| (라) | 에러 없음 | 고르지 않음, 정답 |

### 문제 2 🔺 `prev` 로 고친 것은 정답, 결과는 2 가 아니라 1

`count` 는 `const [count, setCount]` 의 **`const`** 입니다. 이번에 그리는 동안 0 으로 고정되어 있어서 세 줄이 모두 같은 값을 계산합니다.

| 줄 | 이 줄에서 읽은 `count` | 실제로 부른 것 |
|---|---|---|
| 1 | 0 | `setCount(1)` |
| 2 | 0 | `setCount(1)` |
| 3 | 0 | `setCount(1)` |

"1 로 바꿔 줘" 를 세 번 요청한 것이라 다음 그리기 때 화면은 **1** 입니다.

Kotlin 으로 같은 코드를 써도 1 입니다. 8-2 에서 나란히 놓은 Compose 모양을 보세요.

```kotlin
val (count, setCount) = remember { mutableStateOf(0) }
// count 는 val 이라 이 실행 안에서 0 으로 고정
setCount(count + 1)   // setCount(1)
setCount(count + 1)   // setCount(1)
setCount(count + 1)   // setCount(1) → 결과 1
```

Compose 에서 바로 반영되는 것은 `var count by remember { mutableStateOf(0) }` 로 쓰고 `count++` 할 때뿐입니다. React 의 `count` 는 언제나 위의 `val` 쪽처럼 동작합니다. (8-4 의 Compose 설명 문장도 이 기준으로 고쳤습니다.)

고친 코드 `setCount((prev) => prev + 1)` 세 줄은 정답입니다. `prev` 는 앞 요청이 반영된 값을 받으므로 0 → 1 → 2 → 3 이 됩니다.

### 문제 3 🔺 상태와 `View`·`Text` 는 정답, 버튼 태그 이름과 이벤트 이름을 고침

(2026-11-24 React Native 기준으로 다시 채점했습니다. 처음 채점은 웹 기준이라 `View`·`Text` 도 틀렸다고 봤습니다.)

정답인 부분:
- `const [num, setNum] = useState(0)` 과 처음 값 0
- "+1" 은 `setNum((prev) => prev + 1)`, "초기화" 는 `setNum(0)`: 8-4 표 그대로입니다. "+1" 은 한 번만 부르므로 `setNum(num + 1)` 로 써도 됩니다.
- `View` 로 감싸고, 숫자와 버튼 글자를 모두 `<Text>` 안에 넣었습니다. RN 규칙 그대로입니다.
- 이벤트 이름을 camelCase 로 썼습니다 (7단계 보충에서 고친 부분).

고칠 곳:
1. **`<Buttom ...>` 으로 열고 `</Button>` 으로 닫음**: 여는 태그와 닫는 태그 이름이 달라서 JSX 문법 에러입니다.
2. **`Button` → `Pressable`**: RN 의 `Button` 은 글자를 `title` 로만 받고 안쪽 `<Text>` 를 받지 않습니다. 안에 `<Text> +1 </Text>` 을 넣는 모양은 `Pressable` 로 씁니다 (위 「핵심」 마지막 줄).
3. **`onClick` → `onPress`**: RN 은 누름을 `onPress` 로 받습니다.

**정답**

```tsx
import { useState } from "react";
import { View, Text, Pressable } from "react-native";

function Counter() {
  const [num, setNum] = useState(0);

  return (
    <View>
      <Text>현재 숫자: {num}</Text>
      <Pressable onPress={() => setNum(prev => prev + 1)}>
        <Text>+1</Text>
      </Pressable>
      <Pressable onPress={() => setNum(0)}>
        <Text>초기화</Text>
      </Pressable>
    </View>
  );
}
```

`onPress={() => { setNum(0) }}` 처럼 중괄호 블록으로 감싸도 같은 뜻입니다. 줄이 하나면 중괄호 없이 씁니다.

### 문제 4 ❌ 토글이 동작하지 않음 (`map` 안의 조건·spread 와 `key` 위치는 정답)

정답인 부분:
- `todo.id === id ? { ...todo, done: !todo.done } : todo`: 8-5 표의 "하나만 수정" 을 정확히 옮겼습니다. Kotlin 의 `if (it.id == id) it.copy(done = !it.done) else it` 과 같습니다.
- `key={todo.id}` 를 `map` 안의 가장 바깥 요소에 붙였습니다.

**(A) 고칠 곳 2곳**

1. **`setTodos[ ... ]`**: 이름 뒤의 `[ ]` 는 함수 호출이 아니라 **인덱스 접근**입니다(`todos[0]` 처럼). Kotlin 에서도 `setTodos[x]` 는 `get` 이지 호출이 아닙니다. 게다가 `[ ]` 안에는 `...` 를 쓸 수 없어 문법 에러가 납니다. 함수는 **`( )`** 로 부릅니다.
2. **`[...todos, todos.map(...)]`**: 8-5 표의 "추가" 와 "하나만 수정" 을 합쳐 버렸습니다. 이렇게 만들면 배열이 `[할일1, 할일2, [바뀐 할일1, 바뀐 할일2]]` 처럼 원래 2칸 + 배열 1칸, 모두 3칸이 됩니다. `todos.map(...)` 은 **모든 항목을 담은 새 배열 전체**를 돌려주므로, 그 결과가 그대로 새 상태입니다.

| Kotlin | 결과 |
|---|---|
| `todos.map { ... }` | 2칸짜리 새 리스트 (원하는 것) |
| `todos + listOf(todos.map { ... })` | 3칸, 마지막 칸이 리스트 (내 답과 같은 모양) |

**(B) 고칠 곳 3곳**

1. **`todos.map(...)` 을 `{ }` 로 감싸지 않음**: 자주 틀린 점 13번입니다. `{ }` 밖은 글자라서 `todos.map( todo =>` 가 글자로 취급됩니다. 글자 안 `=>` 의 `>` 때문에 문법 에러가 나고, `key={todo.id}` 의 `todo` 도 찾을 수 없게 됩니다.
2. **`TodoItem` 을 쓰지 않음**: `<li>` 와 제목만 그려서 토글 버튼이 없고, `handleToggle` 이 어디에도 연결되지 않았습니다. 그래서 "누르면 `done` 이 뒤집힘" 이 일어나지 않습니다. `TodoItem` 에는 `TodoItemProps` 의 4개(`id`·`title`·`done`·`onToggle`)를 모두 넘깁니다. `onToggle` 에는 `handleToggle` **함수 자체**를 넘깁니다(부르지 않고). 7단계에서 본 `onClick={onDelete(id)}` 함정과 같은 이유입니다.
3. **`<li>`**: 문제 틀이 웹 `<ul>` 이라 따라 쓴 것이므로 감점은 아닙니다. RN 에는 `<ul>`·`<li>` 가 없어서 `<View>` 로 감쌉니다. 안쪽 `<Text>{todo.title}</Text>` 는 RN 에서 맞는 모양입니다 (2026-11-24 RN 기준 재채점).

**정답** (React Native. `TodoItem` 은 7단계 보충 1 의 React Native 정답)

```tsx
type Todo = { id: number; title: string; done: boolean };

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, title: "TS 공부", done: false },
    { id: 2, title: "React 공부", done: false },
  ]);

  const handleToggle = (id: number) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo));
  };

  return (
    <View>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          id={todo.id}
          title={todo.title}
          done={todo.done}
          onToggle={handleToggle}
        />
      ))}
    </View>
  );
}
```

- (A) 는 이전 값 기준이라 8-4 처럼 `setTodos(prev => prev.map(todo => ...))` 로 써도 정답입니다.
- `onToggle={handleToggle}` 은 Kotlin 의 `onToggle = ::handleToggle` 과 같습니다. 함수를 부르지 않고 넘깁니다.
- 누르면 일어나는 순서: "토글" 누름 → `TodoItem` 안의 `() => onToggle(id)` → `handleToggle(1)` → `setTodos(새 배열)` → 다시 그리기 → 1번의 `done` 이 `true` 라서 " (완료)" 표시

## 🔁 보충 문제 (헷갈린 부분 재확인)

**보충 1.** `count` 가 `5` 일 때 버튼을 한 번 누르면 (가)·(나) 각각 화면의 숫자는 몇이 되나요? 줄마다 어떤 값으로 바꿔 달라고 요청하는지도 적어 주세요.

```tsx
// (가)
const handleClickA = () => {
  setCount(count * 2);
  setCount(count + 1);
};

// (나)
const handleClickB = () => {
  setCount(prev => prev * 2);
  setCount(prev => prev + 1);
};
```

**보충 2.** 전등 스위치 `LightSwitch` 컴포넌트를 작성해 주세요. 웹 태그(`div`·`p`·`button`)만 씁니다. (과정이 웹 기준이던 2026-11-24 전에 낸 문제입니다. RN 정답은 채점에 붙였습니다.)
- 상태는 켜짐/꺼짐 하나입니다 (처음은 꺼짐)
- 화면에 `상태: 꺼짐` 또는 `상태: 켜짐` 을 보여 줍니다
- 버튼 하나: 누를 때마다 켜짐과 꺼짐이 뒤집힙니다
- 버튼 글자는 꺼져 있으면 "켜기", 켜져 있으면 "끄기" 입니다

> 💡 참고: 위 「핵심」 표, 8-4 의 `prev => ...`, 7단계의 `{조건 ? A : B}`

**보충 3.** 장바구니 `CartList` 의 (A)·(B)·(C) 를 채워 주세요.

```tsx
type CartItem = { id: number; name: string; qty: number };

function CartList() {
  const [items, setItems] = useState<CartItem[]>([
    { id: 1, name: "사과", qty: 1 },
    { id: 2, name: "바나나", qty: 2 },
  ]);

  const handleAdd = (id: number) => {
    // (A) id 가 같은 항목의 qty 를 1 늘린 새 배열로 setItems
  };

  const handleRemove = (id: number) => {
    // (B) id 가 같은 항목을 뺀 새 배열로 setItems
  };

  return (
    <ul>
      {/* (C) items 를 map 해서 <li> 로 그리기 (key 포함)
          한 줄 모양: 사과 1개 [+1] [삭제]
          "+1" 은 handleAdd, "삭제" 는 handleRemove 를 자기 id 로 부름 */}
    </ul>
  );
}
```

> 💡 참고: (A) 는 문제 4 정답의 `handleToggle`, (B) 는 8-5 표의 "삭제", (C) 는 문제 4 정답의 `{todos.map(...)}` 모양과 7단계 강의 7-3 의 `onClick={() => onDelete(id)}`

### 보충 문제: 내 답

```text
1. 가는 6, 나는 11
```

```tsx
// 보충 2
import { useState } from "react";

function LightSwitch() {
const [lamp, setLamp] = useState(false);

return (
  <div>
    <button onClick={() => setLamp(!lamp)}> {lamp ? "끄기" : "켜기"}</button>
  </div>
);
}
```

```tsx
// 보충 3 (A) 첫 번째 시도 (채팅으로 확인)
const handleAdd = (id: number) => {
    setItems(...items, items.map((item) => item.id === id ? item.qty++ : item))
  };

// 보충 3 (A) 두 번째 시도 (채팅으로 확인)
const handleAdd = (id: number) => {
    setItems(items.map((item) => item.id === id ? {...item. qty: item.qty+1} : item))
  };

// 보충 3 최종 제출
type CartItem = { id: number; name: string; qty: number };

function CartList() {
  const [items, setItems] = useState<CartItem[]>([
    { id: 1, name: "사과", qty: 1 },
    { id: 2, name: "바나나", qty: 2 },
  ]);

  const handleAdd = (id: number) => {
    setItems(items.map((item) => item.id === id ? {...item, qty: item.qty+1} : item))
  };

  const handleRemove = (id: number) => {
    setItems(items.map((item) => item.id === id && item.qty > 0 ? {...item, qty: item.qty-1} : item))
  };

  return (
    <ul>
        {items.map(item => (
            <li>
                {item.name} {item.qty}개
                <button onClick={() => {handleAdd(item.id)}}> [+1] </button>
                <button onClidk={() => {handleRemove(item.id)}}[삭제]</button>
            </li>
        ))
    </ul>
  );
}
```

### 보충 문제: 채점·피드백 (정답 포함)

#### 보충 1 ✅ (가) 6, (나) 11 모두 정답

줄마다 요청하는 값은 적지 않았지만 두 결과가 모두 맞았습니다. 따라가면 아래와 같습니다.

| | 1번 줄 | 2번 줄 | 화면 |
|---|---|---|---|
| (가) | `count` 는 5 로 고정 → `setCount(10)` | `count` 는 여전히 5 → `setCount(6)` | 마지막 요청 **6** |
| (나) | `prev` 5 → 10 | `prev` 10 → 11 | **11** |

(가) 는 앞 줄의 `setCount(10)` 이 뒤 줄 `setCount(6)` 에 덮여서 사라집니다. 문제 2 에서 헷갈렸던 스냅샷이 잡혔습니다.

#### 보충 2 🔺 문제 조건(웹 태그)·삼항·상태 뒤집기 정답, "상태: 켜짐/꺼짐" 표시 줄이 빠짐

정답인 부분:
- 문제 조건대로 `div`·`button` 웹 태그만 썼고, 버튼 글자를 태그 사이에 넣었습니다. (2026-11-24 부터 과정이 React Native 기준이라 아래에 RN 정답도 붙였습니다.)
- `useState(false)` → `boolean` 으로 추론됩니다.
- 버튼 글자 `{lamp ? "끄기" : "켜기"}`: `{ }` 안에 삼항을 넣은 올바른 모양입니다.
- `setLamp(!lamp)`: 한 번 누를 때 한 번만 부르므로 스냅샷 문제가 없어 정답입니다. 이전 값을 뒤집는 것이라 `setLamp(prev => !prev)` 로 써도 됩니다.

고칠 곳: 조건 4개 중 "화면에 `상태: 꺼짐` 또는 `상태: 켜짐` 을 보여 줍니다" 가 빠졌습니다. `<p>상태: {lamp ? "켜짐" : "꺼짐"}</p>` 한 줄이 필요합니다.

**정답**

```tsx
import { useState } from "react";

function LightSwitch() {
  const [lamp, setLamp] = useState(false);

  return (
    <div>
      <p>상태: {lamp ? "켜짐" : "꺼짐"}</p>
      <button onClick={() => setLamp(prev => !prev)}>{lamp ? "끄기" : "켜기"}</button>
    </div>
  );
}
```

```tsx
// React Native 정답
import { useState } from "react";
import { View, Text, Pressable } from "react-native";

function LightSwitch() {
  const [lamp, setLamp] = useState(false);

  return (
    <View>
      <Text>상태: {lamp ? "켜짐" : "꺼짐"}</Text>
      <Pressable onPress={() => setLamp(prev => !prev)}>
        <Text>{lamp ? "끄기" : "켜기"}</Text>
      </Pressable>
    </View>
  );
}
```

Compose 로 옮기면 아래와 같습니다. `{조건 ? A : B}` 가 Kotlin 의 `if (조건) A else B` 자리입니다.

```kotlin
var lamp by remember { mutableStateOf(false) }
Column {
    Text("상태: ${if (lamp) "켜짐" else "꺼짐"}")
    Button(onClick = { lamp = !lamp }) { Text(if (lamp) "끄기" else "켜기") }
}
```

#### 보충 3 🔺 (A) 세 번째 시도에 정답, (B) 는 "-1" 로 구현, (C) 는 `key`·닫는 `}`·오타 2곳

**(A) 시도 과정**

| 시도 | 쓴 것 | 고친 점 |
|---|---|---|
| 1 | `setItems(...items, items.map(... ? item.qty++ : item))` | `...items` 로 인자를 여러 개 넘김(자주 틀린 점 20번). `item.qty++` 는 원래 객체를 고치고, 식의 값이 숫자라 배열 칸에 객체 대신 숫자가 들어감 |
| 2 | `{...item. qty: item.qty+1}` | `item` 뒤의 마침표를 쉼표로 |
| 3 | `{...item, qty: item.qty+1}` | 정답 |

**(B)** 문제 주석 "id 가 같은 항목을 뺀 새 배열" 은 "+1" 옆에 있어서 "수량을 뺀다" 로도 읽힙니다. 문제 문장이 모호했습니다. 의도는 "삭제" 버튼 = 목록에서 그 항목을 없애기(8-5 표의 "삭제", `filter`) 였습니다. 제출한 코드는 "-1" 버튼으로는 정답입니다. `map` + spread + 삼항 모양이 맞고, `item.qty > 0` 으로 0 아래로 내려가지 않게 막은 것도 좋은 처리입니다.

삭제 정답은 `setItems(items.filter(item => item.id !== id))` 이고, Kotlin 의 `items.filter { it.id != id }` 와 같습니다.

**(C)**

정답인 부분:
- `{items.map(...` 으로 `{ }` 를 열었습니다 (문제 4 에서 틀린 부분 해결).
- 문제 틀(`<ul>`·`<li>`)에 맞춰 웹 태그로 썼습니다.
- `{item.name} {item.qty}개` 표시와 `() => { handleAdd(item.id) }` 로 자기 id 를 감싸서 넘긴 것.

고칠 곳:
1. **`key` 누락**: `<li key={item.id}>`. 빠뜨리면 React 가 목록마다 `key` 가 필요하다는 경고를 냅니다.
2. **닫는 `}` 누락**: `))` 뒤에 `}` 가 있어야 `{items.map(` 과 짝이 맞습니다.
3. **`onClidk` 오타**: 웹이면 `onClick`, React Native 면 `onPress`.
4. **두 번째 버튼 여는 태그의 `>` 누락**: `<button onClick={...}>삭제</button>`.

버튼 글자의 대괄호 `[+1]`·`[삭제]` 는 문제의 한 줄 모양에서 "버튼" 을 뜻하는 표시였습니다. 감점은 없고, 정답에서는 뺍니다.

**정답**

```tsx
type CartItem = { id: number; name: string; qty: number };

function CartList() {
  const [items, setItems] = useState<CartItem[]>([
    { id: 1, name: "사과", qty: 1 },
    { id: 2, name: "바나나", qty: 2 },
  ]);

  const handleAdd = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item));
  };

  const handleRemove = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          {item.name} {item.qty}개
          <button onClick={() => handleAdd(item.id)}>+1</button>
          <button onClick={() => handleRemove(item.id)}>삭제</button>
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// React Native 로 그리면 (handleAdd·handleRemove 는 위와 같음)
return (
  <View>
    {items.map(item => (
      <View key={item.id}>
        <Text>{item.name} {item.qty}개</Text>
        <Pressable onPress={() => handleAdd(item.id)}>
          <Text>+1</Text>
        </Pressable>
        <Pressable onPress={() => handleRemove(item.id)}>
          <Text>삭제</Text>
        </Pressable>
      </View>
    ))}
  </View>
);
```

삭제(`filter`) 와 `key` 는 9단계 문제 4 에서 다시 확인합니다.

**8단계 완료!** 상태 스냅샷, 새 배열·객체로 바꾸기가 잡혔습니다. 9단계부터는 React Native 태그(`View`·`Text`·`Pressable`·`TextInput`)로 풉니다. 다음은 9단계 `useEffect` 입니다.
