# 9단계: useEffect

> 화면을 그린 **뒤에** 해야 하는 바깥 일(데이터 불러오기, 타이머, 입력 임시 저장)을 다룹니다. Compose 의 `LaunchedEffect`·`DisposableEffect` 와 나란히 비교합니다. 2026-11-24 부터 **React Native 기준**이라 화면은 `View`·`Text`·`Pressable`·`TextInput` 으로 그립니다 (8단계 맨 위 대응표).

### 시작 전에

`useEffect` 도 React 에서 가져와 씁니다. 화면 컴포넌트는 `react-native` 에서 가져옵니다.

```tsx
import { useState, useEffect } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
```

8-6 의 입력창을 React Native 로 쓰면 아래와 같습니다. `onChangeText` 는 입력된 글자를 바로 넘겨 줍니다(Compose `onValueChange = { name = it }` 와 같은 모양).

```tsx
function NameInput() {
  const [name, setName] = useState("");

  return (
    <View>
      <TextInput
        value={name}
        onChangeText={(text) => setName(text)}
        placeholder="이름"
        style={{ borderWidth: 1, padding: 8 }}   // 테두리가 없으면 입력창이 잘 안 보여서 붙임
      />
      <Text>안녕하세요, {name}님</Text>
    </View>
  );
}
```

이 단계 예제는 실제 서버 대신 아래 **가짜 함수**를 씁니다. 6단계에서 배운 `new Promise` + `setTimeout` 으로 1초 뒤에 결과를 돌려주므로 Expo Snack(https://snack.expo.dev) 에서 그대로 실행됩니다. `console.log` 결과는 Snack 아래 로그 창(내 컴퓨터라면 `npx expo start` 를 띄운 터미널)에 찍힙니다.

> ⚠️ Snack 의 기본 파일은 `App.js` 입니다. 이름을 **`App.tsx`** 로 바꿔야 `useState<Post[]>([])` 같은 TypeScript 문법이 동작합니다. `.js` 그대로면 `Post[]` 의 `]` 에서 `Unexpected token` 에러가 납니다. 화면에는 `App.tsx` 의 `export default` 컴포넌트가 나오므로, 예제 컴포넌트는 `export default function App() { return <PostList />; }` 처럼 감싸서 띄웁니다.

```tsx
type Post = { id: number; title: string };
type User = { id: number; name: string };

// 1초 뒤 글 목록을 돌려줌. shouldFail 이 true 면 실패
function fetchPosts(shouldFail: boolean = false): Promise<Post[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("글 목록을 불러오지 못했습니다"));
      } else {
        resolve([
          { id: 1, title: "React 시작하기" },
          { id: 2, title: "useState 정리" },
          { id: 3, title: "useEffect 정리" },
        ]);
      }
    }, 1000);
  });
}

// 1초 뒤 사용자를 돌려줌. id 가 0 이하면 실패
function fetchUser(id: number): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) {
        reject(new Error("없는 사용자입니다"));
      } else {
        resolve({ id, name: `사용자${id}` });
      }
    }, 1000);
  });
}

// 입력 내용을 임시 저장한다고 치고 콘솔에 찍음 (실제 앱이라면 기기 저장소에 씀)
function saveDraft(text: string): void {
  console.log(`임시 저장: ${text}`);
}
```

실제 서버라면 `const res = await fetch(url); const data = await res.json();` 처럼 `fetch` 를 씁니다. 10단계 종합 실습에서 다룹니다.

### 9-1. 왜 필요한가

컴포넌트 함수는 **화면을 그리는 일**만 해야 합니다. React 는 상태가 바뀔 때마다 함수를 처음부터 다시 실행하므로, 본문에 바깥 일을 적으면 그릴 때마다 실행됩니다.

```tsx
function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);

  // X: 본문에서 바로 불러오기
  fetchPosts().then(data => setPosts(data));

  return <View>{posts.map(p => <Text key={p.id}>{p.title}</Text>)}</View>;
}
```

1. 그림 → `fetchPosts()` 호출
2. 1초 뒤 결과가 오면 `setPosts(새 배열)` → 다시 그림
3. 다시 그리면서 또 `fetchPosts()` → 또 새 배열 → 또 그림 → **끝없이 반복**

`fetchPosts` 는 부를 때마다 새 배열을 돌려주므로 React 는 매번 "바뀌었다" 고 보고 다시 그립니다(8-5: 같은 배열인지로 판단).

Compose 에서도 Composable 본문에서 바로 네트워크를 부르지 않고 `LaunchedEffect` 안에서 부르는 것과 같은 이유입니다. React 에서 그 자리가 `useEffect` 입니다.

### 9-2. useEffect 기본 ⭐

```tsx
useEffect(() => {
  // 화면을 그린 "뒤에" 실행할 일
}, [의존값1, 의존값2]);
```
```kotlin
// Compose
LaunchedEffect(key1, key2) {
    // 컴포지션 뒤에 실행할 일
}
```

두 번째 인자인 **의존성 배열**이 "언제 다시 실행할지" 를 정합니다. Compose 의 `LaunchedEffect` 키와 같은 역할입니다.

| 모양 | 언제 실행 | Compose |
|---|---|---|
| `useEffect(fn, [])` | 화면에 처음 나타날 때 1번 | `LaunchedEffect(Unit)` |
| `useEffect(fn, [userId])` | 처음 1번 + 그 뒤 `userId` 가 바뀌어 다시 그릴 때마다 | `LaunchedEffect(userId)` |
| `useEffect(fn)` (배열 없음) | 그릴 때마다 매번 | `SideEffect { }` 와 비슷 |

예: 숫자가 바뀔 때마다 콘솔에 기록 남기기 (실제 앱이라면 분석 로그를 보내는 자리)

```tsx
function ClickCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(`클릭 ${count}번`);
  }, [count]);

  return (
    <Pressable onPress={() => setCount(prev => prev + 1)}>
      <Text>{count}</Text>
    </Pressable>
  );
}
```

- 순서: 그림 → 화면에 반영 → effect 실행. effect 는 항상 **그린 뒤에** 돕니다.
- 한 컴포넌트에 effect 가 여러 개면 적힌 순서대로 실행됩니다.
- `useEffect` 도 `useState` 처럼 컴포넌트 맨 위에서만 부릅니다(`if`·`for` 안 금지, 8-2 와 같은 규칙).

### 9-3. 의존성 배열 규칙과 무한 반복 ⭐

**규칙: effect 안에서 쓰는 props·state 는 모두 배열에 넣습니다.**

```tsx
function Greeting({ name }: { name: string }) {
  useEffect(() => {
    saveDraft(name);
  }, []);   // X: name 을 빠뜨림

  return <Text>{name}</Text>;
}
```

`[]` 라서 처음 1번만 돕니다. 나중에 `name` 이 바뀌어도 처음 이름만 저장되고, 바뀐 이름은 저장되지 않습니다. `[name]` 으로 고칩니다. Compose 에서 `LaunchedEffect(Unit)` 안에서 `name` 을 쓰면 `name` 이 바뀌어도 다시 실행되지 않는 것과 같습니다.

**무한 반복 주의**: effect 가 자기 의존값을 바꾸면 끝없이 돕니다.

```tsx
useEffect(() => {
  setCount(count + 1);   // count 바뀜 → effect 다시 → 또 바뀜 → ...
}, [count]);
```

| 증상 | 원인 | 고치는 법 |
|---|---|---|
| 처음 값에서 안 바뀜 | effect 안에서 쓰는 값을 배열에 빠뜨림 | 배열에 넣기 |
| 끝없이 반복 | effect 가 자기 의존값을 바꿈 | 그 값은 버튼 같은 이벤트 핸들러에서 바꾸기 |

### 9-4. 정리(cleanup) 함수 ⭐

effect 가 함수를 `return` 하면 React 가 그 함수를 **정리 함수**로 기억했다가 아래 두 때에 부릅니다.

- 의존값이 바뀌어 effect 를 **다시 실행하기 직전**
- 컴포넌트가 화면에서 **사라질 때**

```tsx
function Stopwatch() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(id);   // 정리: 타이머 멈추기
  }, []);

  return <Text>{seconds}초</Text>;
}
```
```kotlin
// Compose: LaunchedEffect 는 코루틴이라 화면에서 사라지면 자동으로 취소됨
LaunchedEffect(Unit) {
    while (true) {
        delay(1000)
        seconds++
    }
}

// Compose: 직접 해제해야 하는 것은 DisposableEffect 의 onDispose 에서
DisposableEffect(Unit) {
    // 등록
    onDispose { /* 해제 */ }
}
```

React 의 `return () => ...` 는 Compose `DisposableEffect` 의 `onDispose { }` 자리입니다. `setInterval` 은 코루틴이 아니라서 자동으로 멈추지 않으므로 `clearInterval` 로 직접 멈춥니다.

8단계와 연결되는 두 가지:

1. **`setSeconds(prev => prev + 1)` 인 이유**: `[]` 라서 effect 는 처음 1번만 돌고, 그 안의 `seconds` 는 처음 그릴 때의 스냅샷 0 으로 고정됩니다(8-4). `setSeconds(seconds + 1)` 로 쓰면 매초 `setSeconds(1)` 만 요청해서 1 에서 멈춥니다.
2. **정리 함수가 없으면**: 화면에서 사라져도 타이머가 계속 돌고, 다시 나타나면 타이머가 하나 더 생깁니다.

> 개발 모드 참고(StrictMode): 앱을 `<StrictMode>` 로 감싸 두면 개발 중에는 React 가 일부러 **실행 → 정리 → 실행** 을 한 번 더 합니다. 정리 함수를 빠뜨렸는지 드러내려는 장치입니다. 감싸져 있는지는 프로젝트 템플릿마다 다릅니다. 감싸져 있다면 개발 중 콘솔 로그가 두 번 찍히는 것은 정상이고, 정리 함수가 없는 타이머는 두 개가 돌아 1초에 2씩 오릅니다. 배포 빌드에서는 한 번만 실행됩니다.

### 9-5. 데이터 불러오기 ⭐ (6단계 async/await 와 연결)

effect 함수 자체에는 `async` 를 붙일 수 없습니다. `async` 함수는 Promise 를 돌려주는데, effect 는 "아무것도 안 돌려주거나 정리 함수를 돌려줘야" 하기 때문입니다. 그래서 **안에서 async 함수를 만들고 바로 부릅니다.**

```tsx
function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUser(userId);
        setUser(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  // 일찍 return 하는 if 는 반드시 모든 hook(useState·useEffect) 아래에 둡니다
  if (loading) return <Text>불러오는 중...</Text>;
  if (error) return <Text>에러: {error}</Text>;
  if (!user) return <Text>사용자 없음</Text>;
  return <Text>{user.name}</Text>;
}
```

RN 에는 빙글빙글 도는 로딩 표시 `ActivityIndicator` 도 있습니다 (Compose 의 `CircularProgressIndicator`). `import { ActivityIndicator } from "react-native";` 로 가져와 `if (loading) return <ActivityIndicator />;` 처럼 씁니다.
```kotlin
// Compose: LaunchedEffect 블록이 코루틴이라 suspend 함수를 바로 부름
LaunchedEffect(userId) {
    loading = true
    error = null
    try {
        user = repository.getUser(userId)
    } catch (e: Exception) {
        error = e.message
    } finally {
        loading = false
    }
}
```

| 연결 | 내용 |
|---|---|
| 6단계 | `async`/`await`, `try`/`catch`/`finally`, `catch (e)` + `instanceof Error` (자주 틀린 점 8번) |
| 8단계 | `useState<User \| null>(null)`, `useState<string \| null>(null)`: `null` 로 시작하는 상태는 제네릭으로 타입을 알려 줌 |
| 8-2 | 일찍 `return` 하는 `if` 는 **모든 hook 아래**에 둡니다. hook 위에서 `return` 하면 어떤 때는 hook 을 부르고 어떤 때는 안 불러서 "맨 위에서, 항상 같은 순서로" 규칙이 깨집니다 |
| 4단계 | `if (!user) return ...` 아래에서는 `user` 가 `User` 로 좁혀져서 `user.name` 을 바로 씁니다 |

### 9-6. 요청이 겹칠 때: `ignore` 플래그 (Compose 와 다른 부분)

`userId` 가 1 → 2 로 빠르게 바뀌면 요청이 두 개 나갑니다. 1번 요청이 늦게 도착하면 2번 사용자 대신 **1번 사용자가 화면을 덮어쓸** 수 있습니다.

Compose 의 `LaunchedEffect(userId)` 는 키가 바뀌면 이전 코루틴을 **자동으로 취소**해서 이 문제가 없습니다. React 는 자동 취소가 없으므로, 정리 함수(9-4: 다시 실행하기 직전에 불림)로 "이전 요청 결과는 버려" 표시를 합니다.

```tsx
useEffect(() => {
  let ignore = false;

  const load = async () => {
    const data = await fetchUser(userId);
    if (!ignore) setUser(data);   // 이미 다른 userId 로 바뀌었으면 버림
  };
  load();

  return () => {
    ignore = true;   // 다음 실행 직전·사라질 때 불림
  };
}, [userId]);
```

순서:
1. `userId` 1 로 effect 실행 (1번 effect 의 `ignore` = false)
2. `userId` 가 2 로 바뀜 → **1번 effect 의 정리 함수 실행** (1번의 `ignore` = true)
3. `userId` 2 로 effect 실행 (2번 effect 의 `ignore` = false)
4. 1번 응답 도착 → 1번의 `ignore` 가 true 라 버림
5. 2번 응답 도착 → 반영

## 🧪 9단계 연습 문제

**문제 1.** 아래 컴포넌트에서 콘솔에 찍히는 글자를 순서대로 써 주세요. (StrictMode 의 두 번 실행은 생각하지 않습니다.)

```tsx
function Page({ userId }: { userId: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => { console.log("A"); }, []);
  useEffect(() => { console.log("B"); }, [userId]);
  useEffect(() => { console.log("C"); });

  return (
    <Pressable onPress={() => setCount(prev => prev + 1)}>
      <Text>{count}</Text>
    </Pressable>
  );
}
```

(1) 화면에 처음 나타날 때
(2) 버튼을 눌러 `count` 만 바뀌었을 때
(3) 부모가 `userId` 를 1 에서 2 로 바꿨을 때

**문제 2.** 아래 타이머에는 문제가 2개 있습니다. 무엇이 문제인지 쓰고 고쳐 주세요. (하나는 화면에 보이는 숫자, 하나는 화면에서 사라진 뒤의 문제입니다.)

```tsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);
  }, []);

  return <Text>{seconds}초</Text>;
}
```

**문제 3.** 입력창에 이름을 치면 아래에 `안녕하세요, {이름}님` 이 보이고, 이름이 바뀔 때마다 「시작 전에」의 `saveDraft` 로 이름을 임시 저장하는 `DraftInput` 컴포넌트를 작성해 주세요.
- 입력창은 「시작 전에」의 `NameInput` 처럼 `TextInput` 의 `value`·`onChangeText` 로 상태와 연결합니다 (처음 값은 빈 문자열)
- 입력창 아래 `<Text>` 에 인사말을 보여 줍니다
- 저장은 `useEffect` 안에서 `saveDraft(name)` 을 부릅니다. 의존성 배열에 무엇을 넣을지 생각해 보세요

**문제 4.** 위 「시작 전에」의 `fetchPosts` 를 써서 글 목록 `PostList` 를 완성해 주세요.

```tsx
function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // (A) 화면에 처음 나타날 때 1번 fetchPosts() 로 불러와 posts 에 저장
    //     실패하면 error 에 메시지, 성공·실패와 상관없이 끝나면 loading 을 false
  }, /* (B) 의존성 배열 */);

  const handleRemove = (id: number) => {
    // (C) id 가 같은 글을 목록에서 없앤 새 배열로 setPosts
  };

  // (D) loading 이면 "불러오는 중...", error 가 있으면 "에러: {메시지}",
  //     아니면 <View> 안에 글마다 <View>: 제목 <Text> 와 "삭제" 버튼
  //     (key 포함, 삭제 버튼은 Pressable + onPress 로 handleRemove)
}
```

> 💡 확인: `fetchPosts(true)` 로 바꿔 실행하면 에러 화면이 나와야 합니다. (C) 는 8단계 보충 3 정답의 `handleRemove`, (D) 는 8단계 보충 3 의 「React Native 로 그리면」 모양이고 `key` 는 `map` 안 가장 바깥 `<View>` 에 붙입니다.

## ✍️ 내 답

> 2026-11-24 에 8강부터 React Native 기준으로 다시 강의를 듣고 풀었습니다.

```text
문제 1-1 : ABC , 1-2 : ABCC ,  1-3:ABCBC
```

```text
문제 2는 계속 1이 찍히고 화면이 그려질때마다 인터벌이 계속 생성된다,
```

```tsx
// 문제 3
function saveDraft(text: string): void {
  console.log(`임시 저장: ${text}`);
}

const [name, setName] = useState<string>("");
useEffect(() => {
  saveDraft(name);
}, [name]);
function draftInput() {
  return {
    <View>
      <TextInput
        value={name}
        onChangeText={(text) => setName(text)}
        style={{borderWidth:1,padding:8 }}/>

      <Text>
        안녕하세요,{name}님
      </Text>
    </View>
  }
}
```

```tsx
// 문제 4
function PostList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      try {
        const res = await fetchPosts()
        setPosts(res)
      } catch(e:any) {
        setError(e?.message ?? "unknown")
      } finally {
        setLoading(false);
      }
    }, []);

    const handleRemove = (id: number) => {
      setPosts(posts.filter( (post) => post.id !== id))
    };

    return (
      <View>
        ${loading && <Text>불러오는중 ... </Text>}
        <li>
        ${posts.map((post) => {
          <View> 
            <Text> 
              ${post.title}
            </Text>
            <Button> 삭제 </Button>
          </View>
        }
        )}
        </li>
      </View>
    );
  }
```

## ✅ 채점·피드백 (정답 포함)

### 문제 1 ✅ 세 상황 모두 정답 (처음부터 쌓인 로그 전체로 적음)

문제는 "그 순간 새로 찍히는 글자"를 물었고, 답은 처음 그릴 때의 `ABC` 부터 쌓인 로그 전체로 적었습니다. 앞의 `ABC` 를 빼면 새로 찍힌 부분이 정답과 같습니다. (3) 의 `ABCBC` 는 (2) 를 거치지 않고 (1) 바로 뒤에 (3) 이 일어난 경우로 적은 것이고, 이것도 맞습니다.

| 상황 | 내 답 | 새로 찍히는 것 (정답) | 이유 |
|---|---|---|---|
| (1) 처음 나타날 때 | ABC | **A B C** | effect 는 모두 처음 그린 뒤 한 번씩, 적힌 순서대로 돕니다 |
| (2) `count` 만 바뀜 | ABC**C** | **C** | A 는 `[]` 라 처음 1번뿐, B 는 `userId` 가 그대로라 건너뜀, C 는 배열이 없어 그릴 때마다 돕니다 |
| (3) `userId` 1 → 2 | ABC**BC** | **B C** | A 는 처음 1번뿐, B 는 의존값 `userId` 가 바뀌어서 돌고, C 는 매번 돕니다 |

Compose 로 옮기면 A = `LaunchedEffect(Unit)`, B = `LaunchedEffect(userId)`, C = `SideEffect { }` 입니다. `count` 가 바뀌면 `Page` 전체를 다시 그리지만, React 는 effect 마다 의존성 배열 값을 지난번 값과 비교해서 바뀐 것만 다시 실행합니다. `LaunchedEffect` 가 키가 같으면 다시 시작하지 않는 것과 같습니다.

### 문제 2 🔺 첫 번째 문제(1 에서 멈춤)는 정답, 두 번째 문제는 생기는 때가 틀림, 고친 코드 없음

**문제 ① 숫자가 1 에서 멈춤: 정답**

이유까지 적으면 이렇습니다. `[]` 라서 effect 는 처음 그릴 때 1번만 돌고, 그 안의 `seconds` 는 처음 그릴 때의 값 0 으로 고정됩니다(8-4 의 "이번 그리기 동안 고정").

| 시간 | 타이머 안에서 읽은 `seconds` | 실제 요청 | 화면 |
|---|---|---|---|
| 1초 | 0 | `setSeconds(1)` | 1 |
| 2초 | 0 | `setSeconds(1)` | 1 |
| 3초 | 0 | `setSeconds(1)` | 1 |

Compose 에서 `val (seconds, setSeconds) = remember { mutableStateOf(0) }` 로 꺼낸 뒤 `LaunchedEffect(Unit) { while (true) { delay(1000); setSeconds(seconds + 1) } }` 로 써도 똑같이 1 에서 멈춥니다. 고치는 법은 `setSeconds(prev => prev + 1)` 입니다.

**문제 ② "그려질 때마다 인터벌이 생긴다": 생기는 때가 틀림**

`[]` 인 effect 는 다시 그릴 때는 돌지 않습니다. 인터벌이 쌓이는 것은 맞지만, 생기는 때는 "그릴 때마다"가 아니라 **화면에 나타날 때마다**이고, 진짜 문제는 **화면에서 사라져도 멈추지 않는 것**입니다(문제의 힌트 "화면에서 사라진 뒤의 문제").

| 상황 | `[]` effect | 인터벌 |
|---|---|---|
| 화면에 처음 나타남 | 1번 돎 | 1개 생김 |
| 다시 그림 (`seconds` 가 바뀜) | 안 돎 | 새로 안 생김 |
| 화면에서 사라짐 (다른 화면으로 이동 등) | 정리 함수가 없음 | 멈추지 않고 계속 `setSeconds` 를 부름 |
| 다시 나타남 | 1번 돎 | 1개 더 생겨 2개 |

"그릴 때마다 생기는" 것은 의존성 배열이 **없을 때**(`useEffect(fn)`, 문제 1 의 C 와 같은 모양)입니다. Android 로 치면 `Handler.postDelayed` 반복을 시작해 놓고 `onDestroy` 에서 `removeCallbacks` 를 안 한 것과 같습니다. 고치는 법은 정리 함수 `return () => clearInterval(id)` 이고, 그러려면 `setInterval` 이 돌려주는 id 를 변수에 받아 둬야 합니다.

**정답**

```tsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(prev => prev + 1);      // ① 이전 값 기준
    }, 1000);

    return () => clearInterval(id);      // ② 사라질 때 타이머 멈춤
  }, []);

  return <Text>{seconds}초</Text>;
}
```

개발 모드에서 앱이 `<StrictMode>` 로 감싸져 있으면 실행 → 정리 → 실행을 한 번 더 합니다. ② 가 없으면 이때 인터벌이 2개가 되어, ① 만 고친 코드는 1초에 2씩 오릅니다. ② 까지 고치면 1씩 오릅니다.

### 문제 3 🔺 의존성 배열 `[name]`·입력창 연결·RN 태그는 정답, 컴포넌트 틀 3곳이 틀려 실행되지 않음

정답인 부분:
- **`[name]`**: 이 문제의 핵심입니다. effect 안에서 `name` 을 쓰므로 배열에 넣었습니다(9-3 규칙). `[]` 였다면 처음 빈 문자열만 저장됩니다.
- `TextInput` 의 `value={name}`·`onChangeText={(text) => setName(text)}`: 강의의 `NameInput` 모양 그대로입니다.
- `View`·`TextInput`·`Text` 만 썼고, 글자를 모두 `<Text>` 안에 넣었습니다.
- `useState<string>("")`: 맞습니다. `""` 만으로도 `string` 으로 추론되므로 `useState("")` 로 줄여도 됩니다.

고칠 곳:
1. **`useState`·`useEffect` 를 컴포넌트 함수 밖(파일 맨 위)에서 부름**: hook 은 **컴포넌트 함수 본문 안**의 맨 위에서만 부를 수 있습니다. 8-2 의 "맨 위에서만" 은 파일 맨 위가 아니라 컴포넌트 함수 안의 맨 위라는 뜻입니다. 밖에서 부르면 실행할 때 React 가 "hook 은 함수 컴포넌트 본문 안에서만 부를 수 있다"는 에러(Invalid hook call)를 냅니다. Compose 에서 `remember`·`LaunchedEffect` 를 `@Composable` 함수 밖에서 못 부르는 것과 같습니다. 상태도 컴포넌트마다 따로 생겨야 하므로 안에 둡니다.
2. **`return { <View> ... </View> }`**: `return` 뒤의 `{` 는 객체를 여는 괄호라서, 그 안에 JSX 를 쓰면 문법 에러입니다. 여러 줄 JSX 는 **`( )`** 로 감쌉니다. Kotlin 에서는 `{ }` 가 블록·람다라서 헷갈리기 쉬운 부분입니다.
3. **`draftInput` 소문자 이름**: 컴포넌트 이름은 **대문자**로 시작합니다(8단계 「핵심」: 대문자 태그 = 컴포넌트). 소문자로 쓰면 `<draftInput />` 을 RN 이 기본 태그 이름으로 읽어 컴포넌트로 쓸 수 없습니다. 문제의 이름도 `DraftInput` 이었습니다.

사소한 점: `안녕하세요,{name}님` 은 쉼표 뒤 공백이 없어 `안녕하세요,철수님` 으로 붙어 나옵니다. 감점은 아닙니다.

**정답**

```tsx
import { useState, useEffect } from "react";
import { View, Text, TextInput } from "react-native";

function DraftInput() {
  const [name, setName] = useState("");      // 1. hook 은 컴포넌트 안 맨 위

  useEffect(() => {
    saveDraft(name);
  }, [name]);                                 // effect 안에서 쓰는 name

  return (                                    // 2. JSX 는 ( ) 로 감쌈
    <View>
      <TextInput
        value={name}
        onChangeText={(text) => setName(text)}
        style={{ borderWidth: 1, padding: 8 }}
      />
      <Text>안녕하세요, {name}님</Text>
    </View>
  );
}

// Snack 에서 띄우기 (3. 대문자 이름이라 태그로 씀)
export default function App() {
  return <DraftInput />;
}
```

```kotlin
// Compose
@Composable
fun DraftInput() {
    var name by remember { mutableStateOf("") }
    LaunchedEffect(name) { saveDraft(name) }
    Column {
        TextField(value = name, onValueChange = { name = it })
        Text("안녕하세요, ${name}님")
    }
}
```

"철" 을 치면: `onChangeText("철")` → `setName("철")` → 다시 그림 → `name` 이 바뀌었으므로 effect 실행 → `saveDraft("철")`.

참고: effect 는 화면에 처음 나타날 때도 1번 돌기 때문에, 처음에 빈 문자열 `""` 도 한 번 저장됩니다. 빈 값을 저장하기 싫으면 effect 안 맨 앞에 `if (name === "") return;` 을 넣습니다.

### 문제 4 ❌ (B)·(C) 정답, (A) 는 `await` 문법 에러, (D) 는 목록이 그려지지 않고 삭제·에러 표시가 동작하지 않음

**(B) `[]` ✅, (C) `posts.filter(post => post.id !== id)` ✅**: 8단계 보충 3 에서 "-1" 로 구현했던 삭제를 이번에 `filter` 로 정확히 썼습니다.

**(A) 고칠 곳 2곳** (`try`/`catch`/`finally` 구조와 `finally` 에서 `setLoading(false)` 한 것은 정답)

1. **effect 함수 안에서 바로 `await`**: `await` 는 `async` 함수 안에서만 쓸 수 있어서 문법 에러입니다. 그렇다고 effect 함수에 `async` 를 붙일 수도 없습니다(9-5). 그래서 **안에 `async` 함수를 만들고 바로 부릅니다.** Compose 의 `LaunchedEffect { }` 블록은 suspend 블록이라 `repository.get()` 을 바로 부를 수 있어서, 그 습관대로 쓴 것으로 보입니다. React 는 여기가 다릅니다.
2. **`catch (e: any)`**: 자주 틀린 점 8번입니다. `any` 는 타입 검사를 꺼 버립니다. `catch (e)` 로 받고 `e instanceof Error ? e.message : "알 수 없는 오류"` 로 좁힙니다(6단계).

**(D) 고칠 곳 6곳**

| 내 코드 | 무엇이 문제인가 | 이렇게 씀 |
|---|---|---|
| `${loading && ...}`·`${posts.map(...)}`·`${post.title}` | Kotlin 문자열 템플릿 습관입니다. JSX 는 `{ }` 만 씁니다. `$` 는 글자로 남아서, `View` 바로 안의 `$` 는 `Text` 밖 글자가 되어 RN 에러가 나고, `Text` 안의 `$` 는 화면에 `$React 시작하기` 처럼 찍힙니다 | `{loading && ...}`·`{post.title}` |
| `posts.map((post) => { <View>...</View> })` | 화살표 뒤 `{ }` 는 **블록**이라 안의 줄을 실행만 하고 아무것도 돌려주지 않습니다(`undefined`). 그래서 목록이 하나도 그려지지 않습니다. Kotlin 람다는 마지막 식이 저절로 반환되지만 JS 블록은 아닙니다 | `posts.map(post => ( <View>...</View> ))` 또는 `{ return <View>...</View>; }` |
| `map` 안 `<View>` 에 `key` 없음 | 자주 틀린 점 22번 | `<View key={post.id}>` |
| `<Button> 삭제 </Button>` | RN `Button` 은 글자를 `title` 로만 받고 안쪽 내용을 받지 않습니다(7·8단계에 이어 세 번째). `onPress` 도 없어서 `handleRemove` 가 연결되지 않아 삭제가 동작하지 않습니다 | `<Pressable onPress={() => handleRemove(post.id)}><Text>삭제</Text></Pressable>` |
| `<li>` | 웹 태그라 RN 에 없습니다. 감쌀 필요도 없습니다 | 지움 |
| `error` 를 화면에 안 그림 | 실패해도 `setError` 만 하고 보여 주지 않습니다 (문제 조건 "에러: {메시지}") | `if (error) return <Text>에러: {error}</Text>;` |

| 화살표 함수 모양 | 뜻 | `map` 결과 |
|---|---|---|
| `post => ( <View /> )` | 괄호 안의 값을 돌려줌 | 그려짐 |
| `post => { <View /> }` | 블록: 실행만 하고 돌려주지 않음 | `undefined` → 안 그려짐 |
| `post => { return <View />; }` | 블록 + `return` | 그려짐 |

**정답**

```tsx
function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {                 // (A) 안에 async 함수
      try {
        const data = await fetchPosts();
        setPosts(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };
    load();                                    // 만들고 바로 부름
  }, []);                                      // (B)

  const handleRemove = (id: number) => {
    setPosts(posts.filter(post => post.id !== id));   // (C)
  };

  // (D) 일찍 return 하는 if 는 모든 hook 아래
  if (loading) return <Text>불러오는 중...</Text>;
  if (error) return <Text>에러: {error}</Text>;

  return (
    <View>
      {posts.map(post => (
        <View key={post.id}>
          <Text>{post.title}</Text>
          <Pressable onPress={() => handleRemove(post.id)}>
            <Text>삭제</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
```

`{loading && <Text>...</Text>}` 처럼 목록 위에 끼워 넣는 방식도 동작합니다(`loading` 이 `boolean` 이라 `0` 문제도 없음). 다만 불러오는 중·에러·목록은 한 번에 하나만 보이는 화면이라 일찍 `return` 하는 쪽이 읽기 쉽습니다.

### 9단계 본 문제 정리

| 문제 | 결과 | 남은 헷갈림 |
|---|---|---|
| 1 | ✅ | - |
| 2 | 🔺 | `[]` effect 는 그릴 때마다가 아니라 나타날 때 1번, 정리 함수가 도는 때 |
| 3 | 🔺 | hook 위치·`return ( )`·대문자 이름 |
| 4 | ❌ | effect 안 `await`, `${ }`, `=> { }` 블록, `key`, RN `Button`, 에러 표시 |

## 🔁 보충 문제 (헷갈린 부분을 새 문제로)

**보충 1.** 아래 `ChatRoom` 에서 각 상황마다 **그 순간 새로 찍히는 로그만** 순서대로 써 주세요. 안 찍히면 "없음" 입니다. (StrictMode 의 두 번 실행은 생각하지 않습니다.)

```tsx
function ChatRoom({ roomId }: { roomId: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(`연결 ${roomId}`);
    return () => console.log(`끊기 ${roomId}`);
  }, [roomId]);

  return (
    <Pressable onPress={() => setCount(prev => prev + 1)}>
      <Text>{count}</Text>
    </Pressable>
  );
}
```

(1) `roomId` 1 로 화면에 처음 나타날 때
(2) 버튼을 눌러 `count` 만 바뀌었을 때
(3) 부모가 `roomId` 를 1 에서 2 로 바꿨을 때
(4) 화면에서 사라질 때

**보충 2.** `UserCard` 컴포넌트를 처음부터 작성해 주세요. props 로 `userId: number` 를 받습니다.
- `userId` 가 바뀔 때마다 「시작 전에」의 `fetchUser(userId)` 로 불러옵니다 (effect 안에 `async` 함수)
- 불러오는 중이면 `불러오는 중...`, 실패하면 `에러: {메시지}`, 성공하면 `이름: {이름}` 을 `<Text>` 로 보여 줍니다
- `catch` 는 `catch (e)` + `instanceof Error` 로 씁니다
- Snack 에서 `export default function App() { return <UserCard userId={1} />; }` 로 띄우면 1초 뒤 `이름: 사용자1`, `userId={0}` 이면 `에러: 없는 사용자입니다` 가 나와야 합니다

> 💡 참고: 9-5 `UserProfile`, 그리고 문제 3 채점의 "컴포넌트 틀 3가지"(hook 은 함수 안 맨 위, `return ( )`, 대문자 이름)

**보충 3.** 아래 `TagList` 에는 틀린 곳이 4곳 있습니다. 찾아서 이유를 쓰고, 고친 코드를 써 주세요. (`handleRemove` 는 맞습니다.)

```tsx
function TagList() {
  const [tags, setTags] = useState<string[]>(["React", "TS", "RN"]);

  const handleRemove = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <View>
      ${tags.length > 0 && <Text>태그 {tags.length}개</Text>}
      {tags.map(tag => {
        <View>
          <Text>{tag}</Text>
          <Button onPress={() => handleRemove(tag)}>지우기</Button>
        </View>
      })}
    </View>
  );
}
```

> 💡 참고: 문제 4 채점의 (D) 표 두 개. `key` 는 태그 글자 자체(`tag`)가 서로 다르므로 그대로 씁니다.

### 보충 문제: 내 답

```text
1-1 : 연결 1
1-2 : 
1-3 : 끊기 1 , 연결 2
1-4 : 끊기 2
```

```tsx
// 보충 2
function UserCard({userId} : (userId:number)) {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string | null> (null);
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true)
      try {
        const data = await fetchUser(userId);
        setUser(data);
      } catch (e: any) {
        if(e instanceof Error) {
          setErrMsg(e.message)
        } else {
          setErrMsg("unknown")
        }
      } finally {
        setLoading(false)
      }
    };
    loadUser();
  },[userId]);

  if(loading){
    return (<Text> 불러오는 중 ... </Text>)
  }
  if(errMsg !== null || user === null) {
    return (<Text> 에러 : {errMsg}</Text>)
  }

  return (
    <Text>이름 : {user?.name}</Text>
  )
}
```

```tsx
// 보충 3 ("이거밖에 모르겠어")
function TagList() {
   const [tags, setTags] = useState<string[]>(["React", "TS", "RN"]);

   const handleRemove = (tag: string) => {
     setTags(tags.filter(t => t !== tag));
   };
 
   return (
     <View>
       ${tags.length > 0 && <Text>태그 {tags.length}개</Text>}
       ${tags.map(tag => {
         <View key={tag}>
           <Text>{tag}</Text> 
           <Button onPress={() => handleRemove(tag)}>지우기</Button>
         </View>
       })}
     </View>
   );
 }
```

### 보충 문제: 채점·피드백 (정답 포함)

#### 보충 1 ✅ 네 상황 모두 정답 (빈칸 = 없음)

이번에는 "새로 찍히는 로그만" 정확히 적었습니다. 문제 2 에서 헷갈렸던 "effect 와 정리 함수가 도는 때"가 잡혔습니다.

| 상황 | 정답 | 이유 |
|---|---|---|
| (1) 처음 나타남 | `연결 1` | 모든 effect 는 처음 그린 뒤 1번 돕니다 |
| (2) `count` 만 바뀜 | 없음 | 다시 그리지만 `roomId` 가 그대로라 effect 도 정리 함수도 안 돕니다 |
| (3) `roomId` 1 → 2 | `끊기 1` → `연결 2` | 다시 실행하기 **직전에** 이전 effect 의 정리 함수, 그다음 새 effect |
| (4) 사라짐 | `끊기 2` | 사라질 때 마지막 effect 의 정리 함수 |

(3) 에서 `끊기 2` 가 아니라 **`끊기 1`** 인 이유: 정리 함수는 `roomId` 가 1 이던 그리기에서 만들어졌으므로 그때의 `roomId`(1) 를 들고 있습니다. 8-4 의 "이번 그리기 동안 고정", 9-6 `ignore` 플래그(1번 effect 의 정리 함수가 1번의 `ignore` 를 바꿈)와 같은 원리입니다.

Compose 로 옮기면 `DisposableEffect(roomId) { connect(roomId); onDispose { disconnect(roomId) } }` 이고, 키가 바뀔 때 `onDispose` → 새 블록 순서로 도는 것까지 같습니다.

#### 보충 2 🔺 effect 안 async 함수·`[userId]`·컴포넌트 틀은 정답, props 타입 문법 에러와 상태 처음 값·초기화 3곳

문제 4 에서 틀렸던 부분이 거의 다 고쳐졌습니다.

| 문제 4·3 에서 틀린 것 | 보충 2 |
|---|---|
| effect 안에서 바로 `await` | ✅ `const loadUser = async () => { ... }; loadUser();` |
| 에러를 화면에 안 그림 | ✅ `에러 : {errMsg}` 를 그림 |
| hook 을 컴포넌트 밖에서 부름 | ✅ 함수 안 맨 위 |
| `return { JSX }` | ✅ `return ( ... )` |
| 소문자 컴포넌트 이름 | ✅ `UserCard` |

그 밖에 `[userId]`, 시작할 때 `setLoading(true)`·`finally` 에서 `setLoading(false)`, 일찍 `return` 하는 `if` 를 모든 hook 아래에 둔 것, `instanceof Error` 로 좁힌 것이 모두 맞습니다.

고칠 곳:

1. **`({userId} : (userId:number))`**: props 타입은 소괄호가 아니라 **객체 타입** `{ userId: number }` 입니다. 소괄호로 쓰면 함수 타입을 쓰다 만 것처럼 읽혀 문법 에러가 나서, 이 줄 때문에 컴포넌트 전체가 실행되지 않습니다. 자주 틀린 점 11·12번(props 는 객체 하나)과 같은 자리입니다. → `({ userId }: { userId: number })`
2. **`useState<boolean>(false)`**: 처음 값이 `false` 라서, 처음 그릴 때는 effect 가 돌기 전이라 `loading`·`errMsg` 가 다 비어 맨 아래 `이름 : ` 이 빈 이름으로 잠깐 보입니다. 그다음 effect 의 `setLoading(true)` 로 "불러오는 중" 이 됩니다. 처음부터 불러올 것이므로 **`true`** 로 시작합니다 (문제 4 틀도 `useState(true)`).
3. **다시 불러올 때 이전 에러를 안 지움**: `userId` 가 바뀌면 다시 불러오는데 `errMsg` 는 그대로 남습니다.

   | 순서 | `userId` | `errMsg` | `user` | 화면 |
   |---|---|---|---|---|
   | 1 | 0 | "없는 사용자입니다" | 없음 | 에러 |
   | 2 | 1 로 바뀌어 성공 | **그대로** "없는 사용자입니다" | 사용자1 | **계속 에러** |

   불러오기 시작할 때 `setErrMsg(null)` 도 같이 합니다 (9-5 `UserProfile` 의 `setError(null)`).
4. **`useState<User>()` 와 `user === null`**: 처음 값 없이 쓰면 `undefined` 로 시작하고 타입은 `User | undefined` 입니다. TypeScript 에서 `null` 과 `undefined` 는 다른 값이라 `user === null` 은 언제나 `false` 입니다(Kotlin 은 `null` 하나뿐이라 헷갈리기 쉬운 부분). 그래서 아래에서 `user?.name` 처럼 `?.` 가 필요해졌습니다. `useState<User | null>(null)` 로 시작하고 `if (!user)` 로 거르면 `null`·`undefined` 를 모두 거르고, 그 아래에서는 `user` 가 `User` 로 좁혀져 `user.name` 을 바로 씁니다(4단계).
5. **`catch (e: any)`**: 자주 틀린 점 8번, 세 번째입니다. `instanceof Error` 로 좁히는 것은 맞았으니 `: any` 만 지웁니다.

**정답**

```tsx
function UserCard({ userId }: { userId: number }) {            // 1
  const [user, setUser] = useState<User | null>(null);          // 4
  const [loading, setLoading] = useState(true);                 // 2
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);                                            // 3
      try {
        const data = await fetchUser(userId);
        setUser(data);
      } catch (e) {                                              // 5
        setError(e instanceof Error ? e.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  if (loading) return <Text>불러오는 중...</Text>;
  if (error) return <Text>에러: {error}</Text>;
  if (!user) return <Text>사용자 없음</Text>;                     // 4: 아래에서 user 는 User
  return <Text>이름: {user.name}</Text>;
}
```

더 해 볼 것(이번 문제 범위 밖): `userId` 가 빠르게 바뀌면 늦게 온 이전 응답이 덮어쓸 수 있습니다. 9-6 의 `ignore` 플래그를 넣으면 막힙니다.

#### 보충 3 ❌ 4곳 중 `key` 1곳만 찾음, `$` 는 오히려 한 곳 더 붙임

| 틀린 곳 | 판정 | 무엇이 문제인가 |
|---|---|---|
| ① `map` 안 `<View>` 에 `key` 없음 | ✅ `key={tag}` | - |
| ② `${tags.length > 0 && ...}` 의 `$` | ❌ 못 찾음, `${tags.map` 에 `$` 를 하나 더 붙임 | 아래 설명 1 |
| ③ `tags.map(tag => { <View>...</View> })` | ❌ 못 찾음 | 아래 설명 2 |
| ④ `<Button onPress={...}>지우기</Button>` | ❌ 못 찾음 | 아래 설명 3 |

**설명 1. `${ }` 는 "따옴표 문자열 안"에서만 씁니다.** `$` 를 하나 더 붙인 것을 보면 `${ }` 를 JSX 문법으로 알고 있는 것 같습니다. 9강 코드의 `` console.log(`연결 ${roomId}`) `` 처럼 JS 에도 `${ }` 가 나오지만, 그건 **백틱 문자열 안**이라서입니다.

| 어디에서 | 코드 자리를 여는 법 | 예 |
|---|---|---|
| Kotlin 문자열 `"..."` 안 | `${ }` | `"이름: ${name}"` |
| JS 백틱 문자열 `` `...` `` 안 | `${ }` | `` `이름: ${name}` `` |
| **JSX 태그 사이** | **`{ }` 만** | `<Text>이름: {name}</Text>` |

JSX 는 문자열이 아니라 태그라서 `{ }` 만 씁니다. 앞에 `$` 를 붙이면 `$` 는 그냥 글자 하나로 남습니다. `<Text>` 안이면 화면에 `$철수` 처럼 찍히고, `<View>` 바로 안이면 `Text` 밖 글자라서 RN 에러가 납니다.

**설명 2. 화살표 뒤 `{ }` 는 "실행만 하는 블록"입니다.** Kotlin 람다 `tags.map { tag -> View() }` 는 마지막 줄이 저절로 반환됩니다. JS 화살표 함수는 다릅니다.

| 모양 | 돌려주는 것 | 화면 |
|---|---|---|
| `tag => ( <View /> )` | `<View />` | 그려짐 |
| `tag => { <View /> }` | 없음(`undefined`) | **아무것도 안 그려짐** |
| `tag => { return <View />; }` | `<View />` | 그려짐 |

`map` 안에서 JSX 를 돌려줄 때는 `=> (` 로 엽니다.

**설명 3. RN `Button` 은 글자를 안에 넣을 수 없습니다** (7단계 보충 1·8단계 문제 3·9단계 문제 4 에 이어 네 번째). 둘 중 하나로 씁니다.

| 방법 | 코드 |
|---|---|
| `Pressable` (안에 `Text` 를 넣는 Compose `Button { Text() }` 모양) | `<Pressable onPress={() => handleRemove(tag)}><Text>지우기</Text></Pressable>` |
| RN `Button` (글자는 `title` 속성) | `<Button title="지우기" onPress={() => handleRemove(tag)} />` |

`tags.length > 0 &&` 는 원래 맞는 부분입니다. `tags.length &&` 로 쓰면 태그가 0개일 때 `0` 이 `Text` 밖 글자가 되어 RN 에러가 납니다(8단계 「핵심」).

**정답**

```tsx
function TagList() {
  const [tags, setTags] = useState<string[]>(["React", "TS", "RN"]);

  const handleRemove = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <View>
      {tags.length > 0 && <Text>태그 {tags.length}개</Text>}
      {tags.map(tag => (
        <View key={tag}>
          <Text>{tag}</Text>
          <Pressable onPress={() => handleRemove(tag)}>
            <Text>지우기</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
```

고친 곳: ② `$` 없이 `{ }` 만, ③ `tags.map(tag => (` 로 돌려줌, ① `key={tag}`, ④ `Pressable` 안에 `<Text>지우기</Text>`.

> 참고: JSX 태그 사이에 같은 줄로 `<View>   {/* 주석 */}` 처럼 공백과 주석을 붙이면, 그 공백이 글자로 남아 RN 에서 `Text` 밖 글자 에러가 날 수 있습니다. JSX 안 주석은 줄을 따로 씁니다.

### 9단계 보충 정리

| 보충 | 결과 | 남은 헷갈림 |
|---|---|---|
| 1 | ✅ | - |
| 2 | 🔺 | props 타입 모양, `null`·`undefined`, 다시 불러올 때 초기화 |
| 3 | ❌ | `${ }` 와 `{ }`, `=> { }` 블록, RN `Button` (문제 4 와 같은 세 가지) |

## 🔁 보충 문제 2차 (세 가지만 하나씩)

보충 3 에서 남은 세 가지를 하나씩 따로 확인합니다. 짧게 답하면 됩니다.

**보충 4.** `name` 이 `"철수"` 일 때 (가)~(라) 가 화면 또는 콘솔에 보여 주는 글자를 그대로 써 주세요.

```tsx
const name = "철수";

<Text>이름: ${name}</Text>        // (가) 화면
<Text>이름: {name}</Text>         // (나) 화면
console.log(`이름: ${name}`);     // (다) 콘솔 (백틱 문자열)
console.log(`이름: {name}`);      // (라) 콘솔 (백틱 문자열)
```

**보충 5.** `a`·`b`·`c` 에 각각 어떤 배열이 들어가나요?

```ts
const a = [1, 2, 3].map(n => n * 10);
const b = [1, 2, 3].map(n => { n * 10 });
const c = [1, 2, 3].map(n => { return n * 10; });
```

> 💡 Kotlin 의 `listOf(1, 2, 3).map { it * 10 }` 과 비교해 보세요. 어느 것이 Kotlin 처럼 동작하고 어느 것이 다른가요?

**보충 6.** `LikeButton` 의 (A)·(B) 를 채워 주세요. 둘 다 "누르면 `likes` 가 1 오르는 `좋아요 누르기` 버튼" 입니다.

```tsx
function LikeButton() {
  const [likes, setLikes] = useState(0);

  return (
    <View>
      <Text>좋아요 {likes}</Text>
      {/* (A) Pressable 로 */}
      {/* (B) RN Button 으로 (글자는 title) */}
    </View>
  );
}
```

### 2차 보충: 내 답

```text
 보충4
 이름: ${name}
 이름: 철수
 이름 : 철수
 이름 : {name} 

 보충5
 a = [10,20,30]
 b = [1,2,3]
 c = [10,20,30]
```

```tsx
// 보충6
function LikeButton() {
  const [likes, setLikes] = useState(0);

  return (
    <View>
      <Text>좋아요 {likes}</Text>
      <Pressable onPress={setLikes(prev => prev +1)} >
        <Text>좋아요 누르기</Text>
      </Pressable>
      <Button title="좋아요 누르기" onclick={setLikes(prev => prev +1)}/>
      {/* (B) RN Button 으로 (글자는 title) */}
    </View>
  );
}
```

### 2차 보충: 채점·피드백 (정답 포함)

#### 보충 4 🔺 (나)·(다)·(라) 정답, (가) 는 `$철수`

| | 내 답 | 정답 | 판정 |
|---|---|---|---|
| (가) `<Text>이름: ${name}</Text>` | 이름: ${name} | **이름: $철수** | ❌ |
| (나) `<Text>이름: {name}</Text>` | 이름: 철수 | 이름: 철수 | ✅ |
| (다) `` `이름: ${name}` `` | 이름 : 철수 | 이름: 철수 | ✅ (공백 차이는 무시) |
| (라) `` `이름: {name}` `` | 이름 : {name} | 이름: {name} | ✅ |

백틱 문자열 안에서는 `${ }` 만 코드이고 `{ }` 는 글자라는 것(다·라)을 정확히 구분했습니다. (가) 는 JSX 가 `$` 를 **글자 하나**로, 바로 뒤 `{name}` 은 여전히 **코드**로 읽어서 `$` + `철수` = `$철수` 가 됩니다. "`${ }` 전체가 글자 그대로 나온다" 가 아니라 "`$` 하나가 덤으로 붙는다" 입니다.

#### 보충 5 🔺 `a`·`c` 정답, `b` 는 `[undefined, undefined, undefined]`

`map` 은 원래 값을 남기는 것이 아니라 **함수가 돌려준 값**으로 새 배열을 만듭니다. `b` 의 함수는 `n * 10` 을 계산만 하고 돌려주지 않으므로 칸마다 `undefined` 가 들어갑니다. 원래 값 `[1, 2, 3]` 이 남지 않습니다.

| | 함수가 돌려주는 것 | 결과 |
|---|---|---|
| `a` `n => n * 10` | `n * 10` | `[10, 20, 30]` |
| `b` `n => { n * 10 }` | 없음 → `undefined` | `[undefined, undefined, undefined]` |
| `c` `n => { return n * 10; }` | `n * 10` | `[10, 20, 30]` |

Kotlin 으로 치면 `listOf(1, 2, 3).map { println(it * 10) }` 이 `[kotlin.Unit, kotlin.Unit, kotlin.Unit]` 이 되는 것과 같습니다. 돌려줄 것이 없는 함수의 결과가 Kotlin 은 `Unit`, JS 는 `undefined` 입니다. Kotlin 처럼 동작하는 것은 `a`·`c` 이고, JSX 에서는 `b` 모양이 "목록이 하나도 안 그려짐" 이 됩니다.

#### 보충 6 🔺 버튼 태그 두 방법 모두 정답, 이벤트에 함수를 넘기지 않고 바로 부름

**정답인 부분**: `Pressable` 안에 `<Text>좋아요 누르기</Text>`, RN `Button` 은 `title="좋아요 누르기"` 로 글자를 줌. 네 번 틀렸던 버튼 태그를 두 방법 모두 바르게 썼습니다. `prev => prev + 1` 도 맞습니다.

고칠 곳:
1. **`onPress={setLikes(prev => prev + 1)}`**: `{ }` 안 코드는 **그릴 때 바로 실행**됩니다(7단계에서 본 `onClick={onDelete(id)}` 함정). 그리는 순간 `setLikes` 가 불려 상태가 바뀌고 → 다시 그리면서 또 불리고 → … 를 반복하다가 React 가 "Too many re-renders" 에러로 멈춥니다. `onPress` 에는 "누르면 실행할 함수" 를 넘겨야 하므로 화살표 함수로 감쌉니다.

   | 쓴 것 | 언제 불리나 | Compose |
   |---|---|---|
   | `onPress={setLikes(prev => prev + 1)}` | 그릴 때 바로 (누르기 전에) | `onClick = likes++` 처럼 쓴 것 (컴파일 에러) |
   | `onPress={() => setLikes(prev => prev + 1)}` | 누를 때 | `onClick = { likes++ }` |

   React 의 `() => ...` 가 Compose 의 `{ ... }` 람다 자리입니다.
2. **`onclick`**: RN `Button` 도 누름은 `onPress` 입니다. 소문자 `onclick` 은 웹에서도 틀립니다(자주 틀린 점 15번).

**정답**

```tsx
import { useState } from "react";
import { View, Text, Pressable, Button } from "react-native";

function LikeButton() {
  const [likes, setLikes] = useState(0);

  return (
    <View>
      <Text>좋아요 {likes}</Text>
      <Pressable onPress={() => setLikes(prev => prev + 1)}>
        <Text>좋아요 누르기</Text>
      </Pressable>
      <Button title="좋아요 누르기" onPress={() => setLikes(prev => prev + 1)} />
    </View>
  );
}
```

### 2차 보충 정리

| 보충 | 결과 | 남은 헷갈림 |
|---|---|---|
| 4 | 🔺 | JSX 의 `$` 는 글자 하나, 뒤 `{ }` 는 코드 (거의 해결) |
| 5 | 🔺 | `=> { }` 블록은 `undefined` 를 돌려줌 |
| 6 | 🔺 | 버튼 태그는 해결, 이벤트에는 함수를 **넘김** (바로 부르지 않음) |

## 🔁 보충 문제 3차 (남은 두 가지)

**보충 7.** `names` 를 화면에 그리는 (가)~(다) 중 이름이 화면에 **나오는 것**을 모두 고르고, 안 나오는 것은 왜 안 나오는지 써 주세요.

```tsx
const names = ["철수", "영희"];

{names.map(n => <Text key={n}>{n}</Text>)}                 // (가)
{names.map(n => { <Text key={n}>{n}</Text> })}             // (나)
{names.map(n => { return <Text key={n}>{n}</Text>; })}     // (다)
```

**보충 8.** 아래 두 함수가 있습니다. 버튼을 **누를 때** 의도대로 불리는 것을 (가)~(라) 에서 모두 고르고, 나머지는 무엇이 문제인지 써 주세요.

```tsx
const handleDelete = (id: number) => { /* id 번 글 삭제 */ };
const handleReset = () => { /* 전부 지우기 */ };

<Pressable onPress={handleDelete(3)}><Text>3번 삭제</Text></Pressable>         // (가)
<Pressable onPress={() => handleDelete(3)}><Text>3번 삭제</Text></Pressable>   // (나)
<Pressable onPress={handleReset}><Text>전부 지우기</Text></Pressable>           // (다)
<Pressable onPress={handleReset()}><Text>전부 지우기</Text></Pressable>         // (라)
```

> 💡 참고: 보충 6 채점의 표. 넘길 값이 없으면 함수 자체(`handleReset`), 넘길 값이 있으면 화살표로 감쌈(`() => handleDelete(3)`) — 8단계 문제 4 의 `onToggle={handleToggle}`(Kotlin `::handleToggle`) 와 같은 구분입니다.

### 3차 보충: 내 답

```text
보충7
가 : 철수 영희
나 : {}안을 실행만하고 출력 안됨
다 : 철수 영희

보충8
나
```

### 3차 보충: 채점·피드백 (정답 포함)

#### 보충 7 ✅ (가)·(다) 나옴, (나) 안 나옴과 이유까지 정답

"`{ }` 안을 실행만 하고 출력 안 됨" 이 정확한 이유입니다. 문제 4·보충 3·보충 5 에서 세 번 헷갈렸던 `=> { }` 블록이 해결됐습니다. 정리하면 `map` 안에서 JSX 를 돌려줄 때는 `=> (` 로 열거나, `{ }` 를 쓰면 `return` 을 붙입니다.

#### 보충 8 🔺 (나) 는 정답, (다) 도 맞는 답인데 빠짐, 나머지 이유는 안 씀

정답은 **(나)·(다)** 입니다.

| | 코드 | 판정 | 이유 |
|---|---|---|---|
| (가) | `onPress={handleDelete(3)}` | ❌ | 그리는 순간 `handleDelete(3)` 이 실행돼 누르기도 전에 3번이 지워지고, `onPress` 에는 결과값(`undefined`)이 들어가 눌러도 아무 일 없음 |
| (나) | `onPress={() => handleDelete(3)}` | ✅ | 넘길 값(3)이 있으니 화살표로 감싸 "누르면 `handleDelete(3)` 을 부르는 함수" 를 넘김 |
| (다) | `onPress={handleReset}` | ✅ | 넘길 값이 없으니 **함수 자체**를 넘김. 누를 때 RN 이 `handleReset` 을 부름. Kotlin 의 `onClick = ::handleReset` |
| (라) | `onPress={handleReset()}` | ❌ | `( )` 를 붙여서 그리는 순간 실행됨. 상태를 바꾸는 함수라면 다시 그릴 때마다 또 불려 "Too many re-renders" |

| 넘길 값 | 쓰는 법 | Kotlin |
|---|---|---|
| 없음 | `onPress={handleReset}` (괄호 없이 이름만) | `onClick = ::handleReset` |
| 있음 | `onPress={() => handleDelete(3)}` | `onClick = { handleDelete(3) }` |
| 어느 쪽이든 틀림 | `onPress={handleReset()}`·`onPress={handleDelete(3)}` | `onClick = handleReset()` (호출 결과를 넘김) |

8단계 문제 4 의 `onToggle={handleToggle}` 도 (다) 와 같은 "함수 자체 넘기기" 였습니다. 이 구분은 10단계 종합 실습에서 다시 확인합니다.

**9단계 완료!** effect 가 도는 때와 정리 함수, effect 안 async 함수·로딩·에러 처리, RN 버튼(`Pressable`·`Button title`), JSX `{ }` 와 `map` 반환이 잡혔습니다. 다음은 10단계 종합 실습입니다.
