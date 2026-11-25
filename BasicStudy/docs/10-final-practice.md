# 10단계: 종합 실습 (API 호출 → 상태 저장 → 화면 표시)

> React Native 기준입니다. 새로 배우는 것은 **두 가지**(실제 서버를 부르는 `fetch`, 긴 목록을 그리는 `FlatList`)뿐이고, 나머지는 7~9단계에서 배운 것을 한 화면에 모읍니다. Android 의 Retrofit·`LazyColumn` 과 나란히 비교합니다.

### 시작 전에

**Snack 준비** (9단계와 같음): https://snack.expo.dev 에서 `App.js` 를 **`App.tsx`** 로 이름을 바꿉니다. 화면에는 `App.tsx` 의 `export default` 컴포넌트가 나옵니다.

```tsx
import { useState, useEffect } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";
```

**연습용 서버**: JSONPlaceholder 는 누구나 연습용으로 쓰는 공개 가짜 REST 서버입니다. 로그인 없이 부를 수 있습니다.

| 주소 | 돌려주는 것 |
|---|---|
| `https://jsonplaceholder.typicode.com/posts?_limit=10` | 글 10개 `{ userId, id, title, body }` |
| `https://jsonplaceholder.typicode.com/users` | 사용자 10명 `{ id, name, email, ... }` |
| 없는 주소·없는 id (예: `/users/999`) | 상태 코드 **404** 와 빈 객체 `{}` |

> 회사 망 등에서 이 주소가 막히면 9단계 「시작 전에」의 가짜 함수 `fetchPosts` 를 대신 씁니다. 화면 코드는 그대로 동작합니다.

### 10-1. `fetch` 로 실제 서버 부르기 ⭐

9단계의 가짜 `fetchPosts` 자리를 실제 서버 호출로 바꿉니다.

```tsx
type Post = { userId: number; id: number; title: string; body: string };

async function getPosts(): Promise<Post[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=10");
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`);
  }
  const data: Post[] = await res.json();
  return data;
}
```
```kotlin
// Retrofit
interface Api {
    @GET("posts?_limit=10")
    suspend fun getPosts(): List<Post>
}
```

| 하는 일 | Kotlin (Retrofit) | TypeScript (`fetch`) |
|---|---|---|
| 요청 | `api.getPosts()` | `await fetch(주소)` → 응답 `res` |
| JSON → 객체 | 변환기(Moshi 등)가 자동으로 | `await res.json()` (**`await` 한 번 더**) |
| 404·500 | 예외(`HttpException`)가 남 | **예외가 안 남.** `res.ok` 가 `false` 가 될 뿐이라 직접 `throw` |
| 타입 | 변환기가 JSON 을 실제로 맞춰 봄 | `const data: Post[]` 는 "이 모양이라고 믿겠다" 는 표시일 뿐, 실제로 검사하지 않음 |

- `fetch` 가 예외를 내는 것은 인터넷이 끊긴 것처럼 **응답 자체를 못 받았을 때**뿐입니다. 서버가 404 를 돌려주는 것은 "응답을 받음" 이라 `catch` 로 가지 않습니다. 그래서 `if (!res.ok) throw ...` 를 꼭 넣습니다.
- `` `서버 오류: ${res.status}` `` 는 백틱 문자열이라 `${ }` 를 씁니다(9단계 보충 4).
- 확인 방법: 주소를 `.../postsss` 처럼 틀리게 바꾸면 404 가 와서 `서버 오류: 404` 에러가 납니다.

### 10-2. `FlatList`: 긴 목록 ⭐ (Compose `LazyColumn`)

```tsx
<FlatList
  data={posts}
  keyExtractor={(item) => String(item.id)}
  renderItem={({ item }) => <Text>{item.title}</Text>}
/>
```
```kotlin
LazyColumn {
    items(posts, key = { it.id }) { post ->
        Text(post.title)
    }
}
```

| | `map` (9단계) | `FlatList` |
|---|---|---|
| Compose | `Column` + `forEach` | `LazyColumn` |
| 그리는 범위 | 전부 한 번에 | 화면에 보이는 것만 (스크롤하며 채움) |
| 목록 데이터 | `posts.map(...)` | `data={posts}` |
| 한 줄 그리기 | `post => ( <Text /> )` | `renderItem={({ item }) => ( <Text /> )}` |
| `key` | 가장 바깥 요소에 `key={...}` | `keyExtractor={(item) => String(item.id)}` |

- `renderItem` 은 `{ item, index }` **객체 하나**를 받습니다. 그래서 props 처럼 `({ item })` 로 꺼냅니다(7단계: props 는 객체 하나).
- `renderItem` 도 화살표 함수라 `=> (` 또는 `=> <Text />` 로 돌려줘야 합니다. `=> { <Text /> }` 면 아무것도 안 그려집니다(9단계 보충 7).
- `keyExtractor` 는 **문자열**을 돌려줘야 해서 `String(item.id)` 로 바꿉니다. 안 쓰면 RN 이 `item.key` → `item.id` → 순서 번호 순으로 알아서 고르지만, 직접 쓰면 무엇이 key 인지 한눈에 보입니다.
- 목록이 비었을 때 보여 줄 것은 `ListEmptyComponent={<Text>글이 없습니다</Text>}` 로 줍니다.
- **스크롤하려면 높이가 정해져야 합니다.** 스크롤 목록은 "정해진 높이 안에서 넘치는 만큼 스크롤" 하는 것이라, 감싸는 `View` 들에 `style={{ flex: 1 }}` (남은 공간을 채움, Compose 의 `Modifier.fillMaxSize()`·`weight(1f)` 와 비슷)을 이어서 줍니다. 빠뜨리면 목록이 화면 밖으로 넘치고 스크롤되지 않습니다.

### 10-3. 목록 한 줄을 컴포넌트로 나누기 (7단계 복습)

```tsx
type PostItemProps = {
  post: Post;
  onRemove: (id: number) => void;
};

function PostItem({ post, onRemove }: PostItemProps) {
  return (
    <View>
      <Text>{post.title}</Text>
      <Pressable onPress={() => onRemove(post.id)}>
        <Text>삭제</Text>
      </Pressable>
    </View>
  );
}

// 부모(PostScreen) 안
<FlatList
  data={posts}
  keyExtractor={(item) => String(item.id)}
  renderItem={({ item }) => <PostItem post={item} onRemove={handleRemove} />}
/>
```

함수를 넘기는 곳이 두 군데인데 모양이 다릅니다(자주 틀린 점 28번).

| 곳 | 코드 | 이유 |
|---|---|---|
| 부모 → `PostItem` | `onRemove={handleRemove}` | 지금 넘길 값이 없음. **함수 자체**를 건네고, `PostItem` 이 나중에 id 를 넣어 부름 (Kotlin `::handleRemove`) |
| `PostItem` 의 버튼 | `onPress={() => onRemove(post.id)}` | 자기 `post.id` 를 넣어 불러야 하므로 화살표로 감쌈 (Kotlin `{ onRemove(post.id) }`) |

### 10-4. 다시 시도: 의존성 배열로 effect 다시 돌리기

에러가 나면 "다시 시도" 버튼으로 다시 불러옵니다. 새 문법 없이 9-3 의 의존성 배열로 만듭니다.

```tsx
const [retryCount, setRetryCount] = useState(0);

useEffect(() => {
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };
  load();
}, [retryCount]);

const handleRetry = () => setRetryCount(prev => prev + 1);
```
```kotlin
// Compose 도 같은 방법: 키가 바뀌면 LaunchedEffect 가 다시 돎
var retryCount by remember { mutableStateOf(0) }
LaunchedEffect(retryCount) { /* 불러오기 */ }
Button(onClick = { retryCount++ }) { Text("다시 시도") }
```

| 순서 | 일어나는 일 |
|---|---|
| 1 | "다시 시도" 누름 → `handleRetry` → `retryCount` 0 → 1 |
| 2 | 다시 그림 → 의존값 `retryCount` 가 바뀜 → effect 다시 실행 |
| 3 | `load()` → `setLoading(true)`·`setError(null)` → 다시 불러옴 |

- 불러오는 함수 `load` 는 **effect 안에** 둡니다. effect 밖(컴포넌트 본문)에 두고 effect 에서 부르면 "effect 안에서 쓰는 것은 배열에" 규칙(9-3) 때문에 그 함수도 배열에 넣어야 해서 복잡해집니다.
- 시작할 때 `setError(null)` 을 해야 이전 에러가 남지 않습니다(9단계 보충 2).
- 버튼은 `onPress={handleRetry}`: 넘길 값이 없으니 함수 자체를 넘깁니다.

### 10-5. 전부 합친 화면

```tsx
import { useState, useEffect } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";

type Post = { userId: number; id: number; title: string; body: string };

async function getPosts(): Promise<Post[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=10");
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`);
  }
  const data: Post[] = await res.json();
  return data;
}

type PostItemProps = {
  post: Post;
  onRemove: (id: number) => void;
};

function PostItem({ post, onRemove }: PostItemProps) {
  return (
    <View>
      <Text>{post.title}</Text>
      <Pressable onPress={() => onRemove(post.id)}>
        <Text>삭제</Text>
      </Pressable>
    </View>
  );
}

function PostScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [retryCount]);

  const handleRemove = (id: number) => {
    setPosts(prev => prev.filter(post => post.id !== id));
  };

  const handleRetry = () => setRetryCount(prev => prev + 1);

  if (loading) return <ActivityIndicator size="large" />;
  if (error) {
    return (
      <View>
        <Text>에러: {error}</Text>
        <Pressable onPress={handleRetry}>
          <Text>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1 }}
      data={posts}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <PostItem post={item} onRemove={handleRemove} />}
      ListEmptyComponent={<Text>글이 없습니다</Text>}
    />
  );
}

export default function App() {
  return (
    <View style={{ flex: 1, paddingTop: 48 }}>
      <PostScreen />
    </View>
  );
}
```

| 코드 | 어느 단계에서 배웠나 |
|---|---|
| `getPosts` 의 `fetch`·`res.ok`·`res.json()` | 10-1 (새로 배움) |
| `FlatList`·`keyExtractor`·`renderItem` | 10-2 (새로 배움) |
| `PostItem` 과 `onRemove` 함수 props | 7단계 props·함수 props, 10-3 |
| `useState<Post[]>([])`·`useState<string \| null>(null)` | 8단계 상태의 타입 |
| `prev => prev.filter(...)` | 8단계 `prev`·새 배열 만들기(삭제) |
| effect 안 `async` 함수·`try`/`catch (e)`/`finally` | 6단계 async/await, 9-5 |
| `[retryCount]` | 9-3 의존성 배열, 10-4 |
| `if (loading) return ...` 를 모든 hook 아래에 | 9-5 |
| `Pressable` + `Text`, `onPress={handleRetry}` | 8단계 「핵심」, 9단계 보충 6·8 |
| `paddingTop: 48` | 휴대폰 맨 위 상태 표시줄에 글자가 가리지 않게 띄움 |

## 🧪 10단계 연습 문제

**문제 1.** (`fetch` 와 `res.ok`) 아래 `getUser` 로 `getUser(999)` 를 부르면 서버가 **404 와 빈 객체 `{}`** 를 돌려줍니다.

```tsx
type User = { id: number; name: string; email: string };

async function getUser(id: number): Promise<User> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  const data: User = await res.json();
  return data;
}

const test = async () => {
  try {
    const user = await getUser(999);
    console.log(user.name);
  } catch {
    console.log("에러");
  }
};
```

(1) `test()` 를 부르면 콘솔에 무엇이 찍히나요? (한 단어)
(2) 404·500 일 때 `catch` 로 가도록 `getUser` 에 넣을 코드를 써 주세요. (`if` 문 하나)

**문제 2.** (`FlatList` 와 함수 넘기기) 빈칸 (A)·(B)·(C) 에 들어갈 코드를 **각각 한 줄씩** 써 주세요. `posts`·`handleRemove` 는 10-5 와 같습니다.

```tsx
function PostItem({ post, onRemove }: PostItemProps) {
  return (
    <View>
      <Text>{post.title}</Text>
      {/* (A) 누르면 onRemove 에 자기 id 를 넘기는 "삭제" 버튼 (Pressable) */}
    </View>
  );
}

// PostScreen 안
<FlatList
  data={posts}
  keyExtractor={/* (B) id 를 문자열로 돌려주는 함수 */}
  renderItem={/* (C) 한 줄마다 PostItem 을 그리는 함수. onRemove 에는 handleRemove 를 넘김 */}
/>
```

**문제 3.** (종합) 사용자 목록 화면 `UserScreen` 의 (A)~(E) 를 채워 주세요. 주소는 `https://jsonplaceholder.typicode.com/users` 입니다.

```tsx
type User = { id: number; name: string; email: string };

async function getUsers(): Promise<User[]> {
  // (A) fetch → res.ok 가 아니면 throw → 아니면 JSON 을 돌려줌
}

function UserScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // (B) effect 안에 async 함수를 만들어 getUsers 로 불러오기
    //     시작할 때 loading true·error null, 실패하면 error 에 메시지(catch (e)), 끝나면 loading false
  }, [/* (C) */]);

  const handleRetry = () => setRetryCount(prev => prev + 1);

  if (loading) return <ActivityIndicator size="large" />;
  if (error) {
    return (
      <View>
        <Text>에러: {error}</Text>
        {/* (D) 누르면 handleRetry 를 부르는 "다시 시도" 버튼 */}
      </View>
    );
  }

  return (
    // (E) FlatList: 한 줄마다 이름과 이메일을 <Text> 두 개로 (keyExtractor 포함, style flex 1)
  );
}

export default function App() {
  return (
    <View style={{ flex: 1, paddingTop: 48 }}>
      <UserScreen />
    </View>
  );
}
```

> 💡 확인: 주소를 `.../usersss` 로 틀리게 바꾸면 `에러: 서버 오류: 404` 와 "다시 시도" 버튼이 나오고, 주소를 고친 뒤 누르면 목록이 나와야 합니다.

**문제 4.** (선택, 검색) 문제 3 의 `UserScreen` 에 검색창을 붙여 주세요.
- `TextInput` 에 글자를 치면 이름(`name`)에 그 글자가 들어간 사람만 목록에 보입니다 (`"Le"` → `Leanne Graham`·`Patricia Lebsack`. 대소문자를 구분합니다)
- 검색어 `query` 는 `useState` 로 만들고, **걸러진 목록은 `useState` 로 만들지 않습니다.** 그릴 때마다 `users` 와 `query` 로 계산합니다. Compose 에서 `val visible = users.filter { ... }` 를 Composable 안에서 바로 계산하는 것과 같습니다 (상태를 두 개로 나눠 들면 서로 어긋날 수 있음)
- 문자열에 글자가 들어 있는지는 `name.includes(query)` 로 봅니다 (Kotlin `name.contains(query)`)

## ✍️ 내 답

```text
문제 1
(1) 에러
(2)
 if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`);
  }
```

```tsx
// 문제 2 ((A) 는 내지 않음)
// PostScreen 안
<FlatList
  data={posts}
  keyExtractor={(post) => {return post.id}}
  renderItem={(post) => {
    return (
      <PostItem post={post }onRemove={handleRemove}>
      </PostItem>
    )
  }
  }
/>
```

```tsx
// 문제 3
import { useState, useEffect } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";

  type User = { id: number; name: string; email: string };

  async function getUsers(): Promise<User[]> {
    // (A) fetch → res.ok 가 아니면 throw → 아니면 JSON 을 돌려줌
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=10");
    if( !res.ok ) {
      throw new Error("Error ${res.status}");
    }
    const data:User[] = await res.json()
    return data
  }

  function UserScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
      setLoading(true)
      setError(null)
      const fetchUsers = async () => {
        try {
          const users = await getUsers()
        } catch(e) {
          if(e instanceof Error) {
            setError(e.message)
          }
        } finally {
          setLoading(false)
        }
        fetchUsers()
    }, []);

    const handleRetry = () => setRetryCount(prev => prev + 1);

    if (loading) return <ActivityIndicator size="large" />;
    if (error) {
      return (
        <View>
          <Text>에러: {error}</Text>
          <Pressable onPress={handleRetry}>
            <Text>
              다시시도
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <FlatList 
        style={{ flex: 1 }}
        data={users} 
        keyExtractor={(user) => String(user.id)}
        renderItem={({user}) => 
          <Text> 이름 : {user.name}</Text>
          <Text> 이메일 : {user.email}</Text>
        }
      />
    );
  }

  export default function App() {
    return (
      <View style={{ flex: 1, paddingTop: 48 }}>
        <UserScreen />
      </View>
    );
  }
```

```tsx
// 문제 4 (선택, 보충 뒤에 풂)
import { useState, useEffect } from "react";
 import { View, Text, Pressable, FlatList, ActivityIndicator, TextInput } from "react-native";

 type User = { id: number; name: string; email: string };

 async function getUsers(): Promise<User[]> {
   const res = await fetch("https://jsonplaceholder.typicode.com/users");
   if (!res.ok) {
     throw new Error(`서버 오류: ${res.status}`);
   }
   const data: User[] = await res.json();
   return data;
 }

 function UserScreen() {
   const [users, setUsers] = useState<User[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [retryCount, setRetryCount] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState<string>("");

   useEffect(() => {
     const load = async () => {
       setLoading(true);
       setError(null);
       try {
         const data = await getUsers();
         setUsers(data);
       } catch (e) {
         setError(e instanceof Error ? e.message : "알 수 없는 오류");
       } finally {
         setLoading(false);
       }
     };
     load();
   }, [retryCount]);

   useEffect(() => {
    const filterUsers = users.filter( (user) => { return user.name.includes(searchKeyword)} )
    setUsers(filterUsers)
   }, [searchKeyword])

   const handleRetry = () => setRetryCount(prev => prev + 1);

   if (loading) return <ActivityIndicator size="large" />;
   if (error) {
     return (
       <View>
         <Text>에러: {error}</Text>
         <Pressable onPress={handleRetry}>
           <Text>다시 시도</Text>
         </Pressable>
       </View>
     );
   }

   return (
    <View>
    <TextInput 
       style={styles.input}
      onChangeText={(text) => {setSearchKeyword(text)}} />
     <FlatList
       style={{ flex: 1 }}
       data={users}
       keyExtractor={(item) => String(item.id)}
       renderItem={({ item }) => (
         <View>
           <Text>이름: {item.name}</Text>
           <Text>이메일: {item.email}</Text>
         </View>
       )}
     />
     </View>
   );
 }

 export default function App() {
   return (
     <View style={{ flex: 1, paddingTop: 48 }}>
       <UserScreen />
     </View>
   );
 }
```

## ✅ 채점·피드백 (정답 포함)

### 문제 1 🔺 (2) 고친 코드는 정답, (1) 은 오답 (정답 `undefined`)

**(1) ❌ 내 답 `에러` → 정답 `undefined`**

404 도 서버가 돌려준 "응답"입니다. 그래서 아무 줄에서도 예외가 나지 않고 `catch` 로 가지 않습니다.

| 줄 | 일어나는 일 |
|---|---|
| `await fetch(".../users/999")` | 404 응답을 받음. 응답을 받았으니 예외 없음, `res.ok` 만 `false` |
| `await res.json()` | 본문 `{}` 를 읽음. 빈 객체도 올바른 JSON 이라 예외 없음 |
| `const data: User = ...` | 타입 표시는 실제로 검사하지 않음. `{}` 를 `User` 라고 믿고 넘어감 |
| `console.log(user.name)` | 객체에 없는 속성을 읽으면 JS 는 예외 대신 `undefined` 를 줌 → **`undefined` 가 찍힘** |

`에러` 는 Retrofit 습관에서 나온 답입니다. Retrofit 은 돌려받는 타입에 따라 404 를 다르게 다루고, `fetch` 는 그중 `Response<User>` 쪽과 같습니다.

| | Retrofit `suspend fun getUser(): User` | Retrofit `suspend fun getUser(): Response<User>` | `fetch` |
|---|---|---|---|
| 404·500 일 때 | `HttpException` 을 던짐 → `catch` | 예외 없음, `response.isSuccessful` 이 `false` | 예외 없음, `res.ok` 가 `false` |
| 예외가 나는 때 | 404·500, 연결 실패 | 연결 실패만 | 연결 실패만 (인터넷 끊김, 없는 도메인) |

Snack 에서 실제로 돌려서 `에러` 가 찍혔다면, 회사 망에서 JSONPlaceholder 가 막혀 응답 자체를 못 받은 경우입니다. `fetch` 가 예외를 내는 건 이 경우뿐입니다.

**(2) ✅ 정답**

강의 코드와 같습니다. 넣는 곳은 `fetch` 바로 다음 줄, `res.json()` 앞입니다.

```tsx
async function getUser(id: number): Promise<User> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`);
  }
  const data: User = await res.json();
  return data;
}
```

- 이제 `getUser(999)` 는 `throw` 를 만나 `catch` 로 가고, `test()` 는 `에러` 를 찍습니다.
- `res.json()` 보다 먼저 검사하는 이유: 500 오류 때 서버가 JSON 이 아닌 HTML 오류 페이지를 돌려주면 `res.json()` 이 먼저 `SyntaxError` 를 냅니다. 그러면 `서버 오류: 500` 대신 알아보기 힘든 JSON 해석 에러 메시지가 화면에 나옵니다.

### 문제 2 🔺 (C) 의 함수 자체 넘기기와 `return` 은 정답, (B) 는 숫자를 돌려줌, (C) 는 `{ item }` 을 꺼내지 않음, (A) 는 내지 않음

| 빈칸 | 내 답 | 결과 | 정답 |
|---|---|---|---|
| (A) | 안 냄 | 미제출 | `<Pressable onPress={() => onRemove(post.id)}><Text>삭제</Text></Pressable>` |
| (B) | `(post) => {return post.id}` | 🔺 숫자를 돌려줌 | `(item) => String(item.id)` |
| (C) | `(post) => { return (<PostItem post={post} onRemove={handleRemove}></PostItem>) }` | 🔺 `onRemove={handleRemove}`·`return` 은 정답, 받은 값이 글 하나가 아님 | `({ item }) => <PostItem post={item} onRemove={handleRemove} />` |

**재확인 통과 두 가지**

- **함수 자체 넘기기 (28번) 해결**: `onRemove={handleRemove}` 정답입니다. 9단계 3차 보충 8 에서 못 고른 모양을 이번에는 직접 썼습니다. 넘길 값이 없으니 함수 자체를 건네고, `PostItem` 이 나중에 id 를 넣어 부릅니다 (Kotlin `::handleRemove`).
- **화살표 함수 반환 (25번) 유지**: `(B)`·`(C)` 모두 `=> { return ... }` 로 블록 안에서 `return` 을 썼습니다. 블록 `{ }` 을 쓰면 `return` 이 있어야 한다는 점을 지켰습니다.

**(B) 🔺 `keyExtractor` 는 문자열을 돌려줘야 함**

RN 공식 문서의 모양은 `(item: ItemT, index: number) => string` 입니다. `post.id` 는 숫자라서 TypeScript 가 막습니다.

```text
Type '(post: Post) => number' is not assignable to type '(item: Post, index: number) => string'.
  Type 'number' is not assignable to type 'string'.
```

`String(item.id)` 로 문자열로 바꾸면 됩니다. Kotlin 의 `post.id.toString()` 과 같습니다.

**(C) 🔺 `renderItem` 이 받는 값은 글 하나가 아니라 객체 `{ item, index, separators }`**

매개변수 이름을 `post` 로 지어도 안에 든 것은 그대로 `{ item, index, separators }` 입니다. 그래서 `post={post}` 는 글이 아니라 이 객체를 넘깁니다.

```text
Type 'ListRenderItemInfo<Post>' is missing the following properties from type 'Post': userId, id, title, body
```

타입 에러를 무시하고 실행하면 `post.title` 이 `undefined` 라 제목 없는 빈 줄만 보이고, "삭제"를 누르면 `onRemove(undefined)` 가 불려 아무것도 지워지지 않습니다.

같은 `FlatList` 안에서도 두 함수가 받는 모양이 다릅니다. 헷갈리기 쉬운 곳입니다.

| | 받는 값 | 쓰는 법 |
|---|---|---|
| `keyExtractor` | 글 하나 (`item`, `index` 를 따로) | `(item) => String(item.id)` |
| `renderItem` | 객체 하나 `{ item, index, separators }` | `({ item }) => ...` 로 꺼내거나 `(info) => ... info.item` |

Compose 의 `itemsIndexed(posts) { index, post -> }` 는 따로 받지만, `renderItem` 은 props 처럼 객체 하나로 묶어서 받습니다. 11번 "props 는 객체 하나"와 같은 모양이라, props 처럼 `({ item })` 으로 꺼냅니다.

**정답 코드**

```tsx
function PostItem({ post, onRemove }: PostItemProps) {
  return (
    <View>
      <Text>{post.title}</Text>
      <Pressable onPress={() => onRemove(post.id)}>
        <Text>삭제</Text>
      </Pressable>
    </View>
  );
}

// PostScreen 안
<FlatList
  data={posts}
  keyExtractor={(item) => String(item.id)}
  renderItem={({ item }) => <PostItem post={item} onRemove={handleRemove} />}
/>
```

- (A) 는 값 `post.id` 를 넣어 불러야 해서 화살표로 감쌉니다. (C) 의 `onRemove={handleRemove}` 와 모양이 다른 이유는 10-3 표에 있습니다.
- 사소한 것: 안이 빈 컴포넌트는 `<PostItem ... />` 로 닫는 것이 보통입니다 (`<PostItem ...></PostItem>` 도 틀리지는 않음). `post={post }onRemove` 처럼 붙여 써도 문법은 통과하지만 속성 사이는 띄어 씁니다.
- 확인 방법: 정답 코드와 내 답을 RN 공식 문서의 `FlatList` 타입 모양으로 `tsc --strict` 검사함 → 정답 0건, 내 답 2건(위 두 메시지).

### 문제 3 ❌ (D)·`keyExtractor`·`catch (e)` 는 정답, 문법 에러 2곳으로 실행되지 않고, 고쳐도 목록이 비고 다시 시도가 동작하지 않음

| 빈칸 | 결과 | 맞은 것 | 고칠 것 |
|---|---|---|---|
| (A) | 🔺 | `res.ok` 검사·`throw`·`res.json()`·`return` | ① 주소 `/posts?_limit=10` → `/users` ② `"Error ${res.status}"` 큰따옴표 → 백틱 |
| (B) | ❌ | `catch (e)` + `instanceof Error`, `finally` 의 `setLoading(false)`, 시작할 때 `setLoading(true)`·`setError(null)` | ① `fetchUsers` 를 닫는 `}` 가 빠짐 (문법 에러) ② `const users = await getUsers()` 는 새 지역 변수 → `setUsers(...)` 가 없음 |
| (C) | ❌ | - | `[]` → `[retryCount]` |
| (D) | ✅ | `<Pressable onPress={handleRetry}><Text>다시시도</Text></Pressable>` | - |
| (E) | 🔺 | `style={{ flex: 1 }}`·`data={users}`·`keyExtractor={(user) => String(user.id)}` | ① `({user})` → `({ item })` ② `<Text>` 두 개를 `<View>` 로 감싸기 (문법 에러) |

`setLoading(true)`·`setError(null)` 를 async 함수 밖(effect 안)에 둔 것은 그대로 동작합니다. 감점하지 않습니다.

**재확인 결과**

| 복습 포인트 | 결과 |
|---|---|
| 28번 함수 자체 넘기기 | (D) 정답. 문제 2 (C) 에 이어 두 번 연속 → 해결 |
| 8번 `catch (e)` | `instanceof Error` 로 거름 → 해결 (3회 틀린 뒤 처음 정답). Error 가 아니면 `error` 가 비어 빈 목록만 보이니, 정답처럼 `: "알 수 없는 오류"` 로 채우면 더 좋음 |
| `keyExtractor` 문자열 (22·30번) | `String(user.id)` 정답. 문제 2 (B) 의 숫자 반환을 고침 |
| 30번 `renderItem` | 객체에서 꺼내는 것까지는 함(문제 2 보다 나아짐). 꺼내는 **이름**이 `user` 라 틀림 |
| 29번 `res.ok` | (A) 에 들어감 |

**고치는 순서대로 보이는 증상**

버그 하나가 다음 버그를 가리고 있어서, 하나를 고칠 때마다 다른 증상이 나옵니다.

| 순서 | 고친 것 | 그때 화면 |
|---|---|---|
| 0 | 그대로 | 문법 에러 (닫는 `}`) |
| 1 | `}` 추가 | 문법 에러 (나란히 놓인 `<Text>` 두 개) |
| 2 | `<View>` 로 감쌈 | 실행됨. 로딩 뒤 빈 화면 (`setUsers` 가 없어 `users` 가 계속 `[]`) |
| 3 | `setUsers(data)` 추가 | 목록을 그리다 `user.name` 에서 에러 (`user` 가 `undefined`) |
| 4 | `({ item })` | 줄은 10개 나오지만 이름·이메일 값이 비어 있음 (주소가 `/posts` 라 `name`·`email` 이 없음) |
| 5 | 주소 `/users` | 목록이 정상으로 나옴 |
| 확인 | 주소를 `/usersss` 로 | `에러: Error ${res.status}` 가 글자 그대로 나오고, 다시 시도를 눌러도 그대로 (`[]` 라 effect 가 다시 안 돎) |

**(B) ① 닫는 `}` 가 빠짐**

```tsx
      } finally {
        setLoading(false)
      }
    }            // ← 이 줄이 빠짐: 여기서 fetchUsers 함수가 끝나야 함
    fetchUsers() // ← 그래서 이 호출이 fetchUsers 함수 안으로 들어가 버림
  }, []);
```

Babel 파서의 메시지는 `Missing initializer in destructuring declaration.` 이고, 가리키는 곳은 실제로 빠진 곳이 아니라 아래쪽 `}, []);` 줄입니다. `}` 가 모자라면 `}, []` 를 `const fetchUsers = ..., []` 처럼 읽기 때문입니다. 에러 줄이 이상하면 그 위쪽의 `{ }` 짝부터 세어 봅니다.

**(B) ② 상태는 `setUsers` 로만 바뀜**

함수 안에서 `const users = ...` 를 새로 만들면 바깥의 상태 `users` 와 이름만 같은 다른 변수입니다. 상태는 그대로 `[]` 라 빈 화면이 나옵니다. 받아 온 값을 `setUsers(data)` 로 넘겨야 다시 그려집니다.

Compose 에서 `var users by remember { mutableStateOf(listOf<User>()) }` 가 있는데 `LaunchedEffect` 안에서 `val users = api.getUsers()` 라고 쓰면 화면이 안 바뀌는 것과 같습니다. Kotlin 은 "Name shadowed" 경고를 주지만 TypeScript 는 기본 설정에서 아무 말도 하지 않습니다.

**(A) ② 큰따옴표 안의 `${ }` 는 글자 그대로**

Kotlin 은 큰따옴표 `"Error ${res.status}"` 안에서 `${ }` 가 값으로 바뀌지만, JS 는 백틱 `` `Error ${res.status}` `` 안에서만 바뀝니다. 큰따옴표·작은따옴표 안에서는 `Error ${res.status}` 가 글자 그대로 나옵니다.

**(C) `[]` 이면 다시 시도가 안 됨**

`[]` 이면 화면에 나타날 때 1번만 돕니다. 다시 시도는 `retryCount` 를 바꾸지만 effect 가 그 값을 보고 있지 않아서 다시 돌지 않습니다. Compose 로 치면 `LaunchedEffect(Unit)` 에 키를 안 준 것이고, `LaunchedEffect(retryCount)` = `[retryCount]` 입니다.

**(E) ① 구조 분해는 이름으로 꺼냄**

`renderItem` 이 주는 객체에는 `item`·`index`·`separators` 만 있습니다. `{ user }` 는 그 안에 없는 이름이라 `undefined` 가 됩니다.

```text
Property 'user' does not exist on type 'ListRenderItemInfo<User>'.
```

Kotlin `val (a, b) = pair` 는 **순서**로 꺼내서 이름을 마음대로 짓지만, JS 객체의 `{ }` 는 **이름**이 같아야 꺼내집니다. 그래서 `({ item })` 입니다.

**(E) ② JSX 는 하나로 감싸서 돌려줌**

```text
Adjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>?
```

Compose 는 람다 안에서 `Text(...)` 를 두 번 부르면 둘 다 그려집니다 (부르는 것 = 그리는 것). React 는 함수가 **돌려준 값 하나**를 그립니다. 값 두 개를 나란히 돌려줄 수 없으니 `<View>` 하나로 감쌉니다 (꾸밈 없는 묶음만 필요하면 `<>...</>`). 여러 줄이면 `=> ( ... )` 로 감쌉니다.

**문법·타입 검사로 안 잡히는 4곳**

주소(`/posts`), 큰따옴표 `${ }`, `setUsers` 없음, `[]` 는 Babel·TypeScript 가 모두 통과시킵니다. 검사를 통과해도 화면에서 직접 확인해야 하는 곳입니다.

**정답 코드**

```tsx
import { useState, useEffect } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";

type User = { id: number; name: string; email: string };

async function getUsers(): Promise<User[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`);
  }
  const data: User[] = await res.json();
  return data;
}

function UserScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [retryCount]);

  const handleRetry = () => setRetryCount(prev => prev + 1);

  if (loading) return <ActivityIndicator size="large" />;
  if (error) {
    return (
      <View>
        <Text>에러: {error}</Text>
        <Pressable onPress={handleRetry}>
          <Text>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1 }}
      data={users}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View>
          <Text>이름: {item.name}</Text>
          <Text>이메일: {item.email}</Text>
        </View>
      )}
    />
  );
}

export default function App() {
  return (
    <View style={{ flex: 1, paddingTop: 48 }}>
      <UserScreen />
    </View>
  );
}
```

- 확인 방법: 내 답·단계별로 고친 판·정답 코드를 Babel 파서(tsx)와 `tsc --strict`(RN 공식 문서의 `FlatList` 타입 모양)로 검사함 → 정답 코드 0건.

### 문제 4 🔺 검색어 상태·`onChangeText`·`includes` 는 정답, 걸러진 목록을 effect 에서 `setUsers` 로 덮어써서 다 지워도 목록이 돌아오지 않음

| 요구 | 결과 | 내용 |
|---|---|---|
| 검색어를 `useState` 로 | ✅ | `searchKeyword` |
| `TextInput` + `onChangeText` | ✅ | 글자를 칠 때마다 `setSearchKeyword(text)` |
| `includes` 로 거르기 | ✅ | `user.name.includes(searchKeyword)` |
| `TextInput`·`FlatList` 를 하나로 감싸기 | ✅ | `<View>` 로 직접 감쌈 (32번, 문제 3 에서 틀린 것) |
| 걸러진 목록은 상태로 두지 않고 그릴 때 계산 | ❌ | effect 에서 `setUsers(filterUsers)` 로 원본 `users` 를 덮어씀 |
| `renderItem` | 판정 안 함 | 바로 앞에서 보여 준 정답 코드 그대로라 30번 확인으로 세지 않음 |

**덮어쓰면 지워도 돌아오지 않습니다**

| 검색창 | 제출 코드의 목록 | 정답 코드의 목록 |
|---|---|---|
| `L` | 2명 | 2명 |
| `Le` | 2명 (Leanne Graham, Patricia Lebsack) | 2명 |
| `L` (한 글자 지움) | 2명 | 2명 |
| 빈칸 (다 지움) | **2명** | 10명 |
| `L` → `Lx` → `L` | **0명** 에서 멈춤 | 2명 |

- 원인: 거를 때마다 이미 걸러진 `users` 에서 다시 거릅니다. 원본 10명은 `setUsers(filterUsers)` 를 부르는 순간 사라졌고 되돌릴 곳이 없습니다.
- 고치는 법: 두 번째 `useEffect` 를 지우고, 그릴 때 `const visibleUsers = users.filter((user) => user.name.includes(query));` 로 계산해서 `data={visibleUsers}` 로 넘깁니다. `users` 는 서버에서 받은 원본 그대로 둡니다. Compose 에서 Composable 안에 `val visible = users.filter { it.name.contains(query) }` 라고 쓰는 것과 같습니다.
- 의존성에 `users` 를 넣는 것으로는 못 고칩니다. `filter` 는 매번 새 배열을 만들어서 `setUsers` → `users` 바뀜 → effect 다시 실행이 끝없이 반복됩니다.
- 확인 방법: 거르는 순서를 JS 로 그대로 따라 돌린 결과입니다(React 실행은 아님).

**`styles`**

붙여 주신 코드 기준으로는 `styles` 가 어디에도 없어서 tsc 가 `Cannot find name 'styles'.` 를 냅니다. 정말 없다면 실행할 때 에러가 납니다. Snack 에 `const styles = StyleSheet.create({ ... })` 를 따로 두셨다면 괜찮습니다. 정답 코드는 `style={{ ... }}` 로 바로 썼습니다.

**작은 팁 (감점 아님)**

- `TextInput` 에 `value={query}` 를 같이 주면 화면의 글자와 상태가 항상 같습니다(8단계 입력창 연결, Compose `TextField(value = query, onValueChange = ...)`).
- `onChangeText={(text) => {setSearchKeyword(text)}}` 는 동작합니다. 받은 값을 그대로 넘기기만 하니 `onChangeText={setQuery}` 처럼 함수 자체를 넘겨도 됩니다(28번).
- 바깥 `<View>` 에 `style={{ flex: 1 }}` 를 줘야 `FlatList` 의 `flex: 1` 이 나눠 가질 높이가 생깁니다. 정답 코드에 넣었으니 Snack 에서 목록이 끝까지 스크롤되는지 확인해 보세요.

**정답 코드**

```tsx
import { useState, useEffect } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, TextInput } from "react-native";

type User = { id: number; name: string; email: string };

async function getUsers(): Promise<User[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`);
  }
  const data: User[] = await res.json();
  return data;
}

function UserScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [retryCount]);

  const handleRetry = () => setRetryCount(prev => prev + 1);

  if (loading) return <ActivityIndicator size="large" />;
  if (error) {
    return (
      <View>
        <Text>에러: {error}</Text>
        <Pressable onPress={handleRetry}>
          <Text>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  const visibleUsers = users.filter((user) => user.name.includes(query));

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="이름 검색"
        style={{ borderWidth: 1, padding: 8, margin: 8 }}
      />
      <FlatList
        style={{ flex: 1 }}
        data={visibleUsers}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View>
            <Text>이름: {item.name}</Text>
            <Text>이메일: {item.email}</Text>
          </View>
        )}
      />
    </View>
  );
}

export default function App() {
  return (
    <View style={{ flex: 1, paddingTop: 48 }}>
      <UserScreen />
    </View>
  );
}
```

- 확인 방법: 제출 코드와 정답 코드를 Babel 파서와 `tsc --strict` 로 검사함 → 제출 코드 `styles` 1건, 정답 코드 0건.

### 10단계 본 문제 정리

| 문제 | 결과 | 남은 헷갈림 |
|---|---|---|
| 1 | 🔺 | `fetch` 는 404 에서 예외 없음 (29번) |
| 2 | 🔺 | `renderItem` 은 객체 `{ item }` (30번), (A) 미제출 |
| 3 | ❌ | 상태는 setter 로만 (31번), `[retryCount]` (23번), `renderItem` 꺼내는 이름 (30번), JSX 뿌리 하나 (32번), 백틱 (13번), 닫는 `}` |
| 4 (선택) | 🔺 | 계산되는 값은 상태로 두지 않음 (33번), `renderItem` 은 이번에 확인 안 됨 (30번) |

## 🔁 보충 문제 (헷갈린 부분을 새 문제로)

모두 한 줄 답입니다. 보충 5 는 선택입니다.

**보충 1.** (`fetch` 가 `catch` 로 가는 때) 각 상황에서 콘솔에 찍히는 줄을 **모두** 순서대로 써 주세요.

```tsx
const check = async (url: string) => {
  try {
    const res = await fetch(url);
    console.log("상태", res.status);
    const data = await res.json();
    console.log("이름", data.name);
  } catch {
    console.log("에러");
  }
};
```

- (1) `check(".../users/1")`: 200 과 `{ id: 1, name: "Leanne Graham", ... }` 가 옴
- (2) `check(".../users/999")`: 404 와 `{}` 가 옴
- (3) 휴대폰을 비행기 모드로 바꾸고 `check(".../users/1")`

**보충 2.** (`renderItem` 에서 꺼내는 이름) `data={users}` 일 때 이름이 **제대로 나오는 것을 모두** 골라 주세요. `users` 는 문제 3 의 `User[]` 입니다.

```tsx
(가) renderItem={(info) => <Text>{info.item.name}</Text>}
(나) renderItem={({ name }) => <Text>{name}</Text>}
(다) renderItem={(user) => <Text>{user.name}</Text>}
(라) renderItem={({ item }) => <Text>{item.name}</Text>}
```

**보충 3.** (상태는 setter 로만) 아래 화면에 보이는 숫자는 무엇인가요? 그리고 5 가 보이도록 `load` 안의 한 줄을 고쳐 주세요.

```tsx
async function getCount(): Promise<number> {
  return 5;
}

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const count = await getCount();
    };
    load();
  }, []);

  return <Text>{count}</Text>;
}
```

**보충 4.** (다시 돌려야 하는 값은 배열에) 화면이 나타난 뒤 "다시 시도"를 3번 누르면 `불러오기` 는 모두 몇 번 찍히나요? 그리고 누를 때마다 찍히게 하려면 `[]` 를 무엇으로 바꾸나요? (StrictMode 의 두 번 실행은 생각하지 않습니다.)

```tsx
function Loader() {
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.log("불러오기");
  }, []);

  return (
    <Pressable onPress={() => setRetryCount(prev => prev + 1)}>
      <Text>다시 시도</Text>
    </Pressable>
  );
}
```

**보충 5.** (선택, 백틱) `const status = 404;` 일 때 각 줄이 찍는 것을 써 주세요.

```tsx
console.log("서버 오류: ${status}");   // (가)
console.log(`서버 오류: ${status}`);   // (나)
console.log("서버 오류: " + status);   // (다)
```

### 보충 문제: 내 답

```text
1-1 : 상태 : 200 , 이름 : Leanne Graham , 
1-2 : 상태 : 404 , 이름 : undefined
1-3 : 에러

보충2 : 라

보충3 : 0 , getCount이후 setCount(count)

보충4 : 1번 찍힘, [retryCount] 로 바꾸면 됨
```

보충 5 는 선택이라 풀지 않음.

### 보충 문제: 채점·피드백 (정답 포함)

| 보충 | 결과 | 한 줄 |
|---|---|---|
| 1 | ✅ | 세 상황 모두 정답. 문제 1 에서 틀린 "404 → `undefined`" 를 맞힘 |
| 2 | 🔺 | (라) 정답, 문제 2·3 에서 쓴 모양 (다)·(나) 를 안 고른 것도 정답. (가) 를 놓침 |
| 3 | ✅ | 0 정답, `setCount(count)` 를 더하면 5 가 보임 |
| 4 | ✅ | 1번 정답, `[retryCount]` 정답 |
| 5 | 미제출 (선택) | 정답만 아래에 적음 |

**보충 1 정답**

```text
(1) 상태 200
    이름 Leanne Graham
(2) 상태 404
    이름 undefined
(3) 에러
```

- (2): 404 도 서버가 응답을 보낸 것이라 `catch` 로 가지 않습니다. `{}` 에 `name` 이 없으니 `undefined` 가 찍힙니다. 문제 1 에서 틀린 부분을 이번에 맞혔습니다.
- (3): 서버까지 가지 못하면 `fetch` 자체가 실패합니다(RN 메시지 `Network request failed`). 그래서 첫 `console.log` 전에 바로 `catch` 로 갑니다.

**보충 2 정답: (가)·(라)**

`renderItem` 은 `{ item, index, separators }` 객체 하나를 받습니다. (라) 와 (가) 는 이 객체에서 `item` 을 꺼내는 두 가지 쓰는 법입니다.

| 보기 | 받는 것 | 결과 |
|---|---|---|
| (가) `(info) => info.item.name` | 객체 통째로 `info` 에 받고, 쓸 때 `.item` 으로 꺼냄 | 정답 |
| (라) `({ item }) => item.name` | 받자마자 `item` 을 꺼냄 | 정답 |
| (나) `({ name }) => name` | 객체에 `name` 이 없음 | 에러 |
| (다) `(user) => user.name` | `user` 는 사용자 한 명이 아니라 객체 전체 | 에러 |

- `({ item })` 은 `const item = info.item;` 을 매개변수 자리에서 한 번에 하는 것입니다. 그래서 (가) 와 (라) 는 같은 값을 꺼냅니다.
- (나)·(다) 의 tsc 메시지는 둘 다 같습니다.

```text
Property 'name' does not exist on type 'ListRenderItemInfo<User>'.
```

- (다) 를 고치면 `(user) => user.item.name` 입니다. 매개변수 이름을 `user` 로 지어도 안에 든 것은 여전히 `{ item, index, separators }` 객체입니다.

**보충 3 정답: 0**

```tsx
const load = async () => {
  const count = await getCount();
  setCount(count); // ← 이 줄을 더하면 5 가 보임
};
```

- 답처럼 `setCount(count)` 를 더하면 5 가 보입니다. "한 줄을 고쳐" 라고 했지만 줄을 더한 것도 같은 뜻이라 정답입니다(tsc 0건).
- 안쪽 `count` 는 바깥 상태 `count` 와 이름만 같은 다른 변수입니다. 이 코드는 안쪽 값 5 를 setter 에 넘겨서 동작합니다. 이름을 다르게 쓰면 덜 헷갈립니다: `const data = await getCount(); setCount(data);` 또는 `setCount(await getCount());`.

**보충 4 정답: 1번, `[retryCount]`**

- `[]` 는 화면이 나타날 때 1번만 돕니다. 버튼으로 `retryCount` 가 바뀌어도 effect 는 그 값을 보고 있지 않습니다.
- `[retryCount]` 로 바꾸면 처음 1번 + 누를 때마다 1번 = 모두 4번 찍힙니다(Compose `LaunchedEffect(retryCount)`).

**보충 5 정답 (선택, 미제출)**

```text
(가) 서버 오류: ${status}    ← 큰따옴표라 글자 그대로
(나) 서버 오류: 404
(다) 서버 오류: 404
```

Kotlin 은 큰따옴표 (가) 에서도 `404` 로 바뀌지만, JS 는 백틱 (나) 안에서만 `${ }` 가 값으로 바뀝니다. (다) 처럼 `+` 로 이어 붙여도 됩니다.

### 보충 정리

| 복습 포인트 | 결과 |
|---|---|
| `fetch` 404 는 예외 없음 (29번) | 해결 (보충 1) |
| 상태는 setter 로만 (31번) | 해결 (보충 3) |
| 다시 돌려야 하는 값은 배열에 (23번) | 해결 (보충 4) |
| `renderItem` 이 받는 객체 (30번) | 🔺 — `info.item` 도 같은 뜻인 것을 놓침 → 2차 보충 |
| 백틱 (13번) | 다시 확인 못 함 (보충 5 미제출) |

## 🔁 2차 보충 문제 (`renderItem` 이 받는 객체)

한 문제, 한 줄 답입니다.

**2차 보충 1.** `todos` 는 `{ id: number; title: string }[]` 입니다. (가) 와 같은 화면이 나오도록 (나) 의 빈칸 두 곳을 채워 주세요.

```tsx
(가) renderItem={({ item, index }) => <Text>{index + 1}번: {item.title}</Text>}
(나) renderItem={(x) => <Text>{x.____ + 1}번: {x.____.title}</Text>}
```

### 2차 보충: 내 답

```text
나) index, item
```

### 2차 보충: 채점·피드백 (정답 포함)

**2차 보충 1 ✅** 두 빈칸 모두 정답입니다.

```tsx
(나) renderItem={(x) => <Text>{x.index + 1}번: {x.item.title}</Text>}
```

- `x` 는 `{ item, index, separators }` 객체 통째입니다. (가) 는 받자마자 `item`·`index` 를 꺼냈고, (나) 는 쓸 때 `x.` 으로 꺼냈습니다. 같은 값입니다.
- 매개변수 이름 `x` 는 마음대로 지어도 되지만, 그 안의 `item`·`index` 는 정해진 이름입니다(문제 3 의 `({user})` 가 틀린 이유).
- 30번은 "2차 보충 정답"으로 적고, 문제 4 나 10단계 정리에서 `renderItem` 을 다시 맞히면 해결로 바꿉니다. 바로 위 보충 2 피드백에 같은 모양이 있어서, 이번 정답만으로는 확인이 약합니다.

## 🔁 문제 4 보충 문제

두 문제, 모두 짧은 답입니다.

**문제 4 보충 1.** (계산되는 값은 상태로 두지 않음) 버튼을 한 번 누르면 화면의 "완료 N개" 에서 N 은 무엇인가요? 그리고 `doneCount` 상태 줄을 지우고 그 자리에 쓸 한 줄을 써 주세요.

```tsx
type Todo = { id: number; title: string; done: boolean };

function TodoSummary() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, title: "장보기", done: true },
    { id: 2, title: "운동", done: false },
    { id: 3, title: "공부", done: true },
  ]);
  const [doneCount, setDoneCount] = useState(2);

  const handleAdd = () =>
    setTodos(prev => [...prev, { id: prev.length + 1, title: "청소", done: true }]);

  return (
    <View>
      <Text>완료 {doneCount}개</Text>
      <Pressable onPress={handleAdd}>
        <Text>완료된 할 일 추가</Text>
      </Pressable>
    </View>
  );
}
```

**문제 4 보충 2.** (`renderItem` 처음부터 쓰기) `products` 는 `{ id: number; title: string; price: number }[]` 입니다. 한 줄에 `사과 - 1000원` 처럼 나오도록 빈칸에 들어갈 `renderItem` 을 써 주세요.

```tsx
<FlatList
  data={products}
  keyExtractor={(item) => String(item.id)}
  renderItem={______}
/>
```

### 문제 4 보충: 내 답

```text
 보충 1. 
 doneCount = 2
 {todos.filter({todo} => todo.done).length}

 보충2.
 <FlatList
   data={products}
   keyExtractor={(item) => String(item.id)}
   renderItem={({item}) => (<Text> {item.title} - {item.price} </Text>)}
 />
```

### 문제 4 보충: 채점·피드백 (정답 포함)

| 보충 | 결과 | 한 줄 |
|---|---|---|
| 1 | 🔺 | N = 2 정답, 상태 대신 `todos` 로 계산한 것도 정답. 콜백 매개변수 `{todo} =>` 가 틀림 |
| 2 | ✅ | 새 타입으로 처음부터 쓴 `renderItem` 정답. "원" 이 빠지고 앞뒤에 빈칸이 붙은 것은 글자 모양만 다름 |

**보충 1 정답: 2**

- 버튼을 누르면 `todos` 는 4개, 완료는 3개가 되지만 `doneCount` 는 아무도 바꾸지 않아서 2 그대로입니다. 두 상태가 어긋난 것입니다.
- `doneCount` 상태 줄 자리에 쓸 한 줄:

```tsx
const doneCount = todos.filter((todo) => todo.done).length;
```

- 답처럼 JSX 안에 바로 `{todos.filter(...).length}` 로 써도 같은 뜻입니다(그릴 때 계산). 이렇게 고치면 버튼을 누른 뒤 3 이 보입니다.
- 틀린 곳은 매개변수 모양 하나입니다.

| 쓴 모양 | 결과 |
|---|---|
| `{todo} => todo.done` | 문법 에러 `Unexpected token, expected ","`. 매개변수에 `{ }` 를 쓰면 괄호 `({ ... })` 로 감싸야 함 |
| `({todo}) => todo.done` (괄호를 넣은 판) | tsc `Property 'todo' does not exist on type 'Todo'.` 할 일 하나 안에 `todo` 라는 속성이 없음 |
| `(todo) => todo.done` | 정답. `filter` 는 할 일 하나를 그대로 넘겨줌 |

- `{ }` 는 받은 것 안에서 그 이름의 속성을 꺼냅니다. `renderItem` 은 `{ item, index, separators }` 를 주니까 `({ item })` 이고, `filter` 는 할 일 하나(`{ id, title, done }`)를 주니까 그 안에 `todo` 는 없습니다.
- Kotlin 비교: Kotlin 은 `todos.filter { todo -> todo.done }` 처럼 람다 전체를 `{ }` 로 감쌉니다. JS 는 `(todo) => todo.done` 처럼 괄호 안에 매개변수를 넣습니다.

**보충 2 정답**

```tsx
renderItem={({ item }) => <Text>{item.title} - {item.price}원</Text>}
```

- `({ item })` 모양 정답입니다. 새 타입을 처음부터 써서 맞혔으므로 30번은 해결입니다.
- 글자 모양 메모: `<Text> {item.title} - {item.price} </Text>` 는 화면에 ` 사과 - 1000 ` 으로 나옵니다. 한 줄 안의 빈칸은 JSX 가 그대로 남기고(JSX 변환 결과 기준, RN 실행은 아님), "원" 이 빠졌습니다.

- 확인 방법: 제출한 줄을 Babel 파서와 `tsc --strict` 로 검사함 → 보충 1 그대로는 문법 에러, 괄호를 넣은 판은 `todo` 속성 에러 1건, 고친 줄 0건. 보충 2 는 0건.

### 문제 4 보충 정리

| 복습 포인트 | 결과 |
|---|---|
| 계산되는 값은 상태로 두지 않음 (33번) | 해결 (보충 1, 상태 대신 계산) |
| `renderItem` 처음부터 쓰기 (30번) | 해결 (보충 2) |
| 콜백 매개변수 모양 (34번) | 새로 틀림 → 2차 보충 |

## 🔁 문제 4 2차 보충 문제 (콜백 매개변수 모양)

10단계 마지막 보충입니다. 한 문제이고, 틀려도 정답을 보고 10단계 정리로 넘어갑니다.

**문제 4 2차 보충 1.** `todos` 는 `Todo[]`(`{ id: number; title: string; done: boolean }`) 입니다. 두 빈칸(매개변수 자리)을 채워 주세요. `=>` 오른쪽 본문은 바꾸지 않습니다.

```tsx
const titles = todos.map(______ => todo.title);

<FlatList
  data={todos}
  keyExtractor={(item) => String(item.id)}
  renderItem={______ => <Text>{item.title}</Text>}
/>
```

### 문제 4 2차 보충: 내 답

```text
(todo)
({item})
```

### 문제 4 2차 보충: 채점·피드백 (정답 포함)

**문제 4 2차 보충 1 ✅** 두 빈칸 모두 정답입니다.

```tsx
const titles = todos.map((todo) => todo.title);

renderItem={({ item }) => <Text>{item.title}</Text>}
```

- `map` 은 할 일 하나를 그대로 넘겨주니 `(todo)`, `renderItem` 은 `{ item, index, separators }` 를 넘겨주니 `({ item })` 입니다. 나란히 놓인 두 모양을 구분했으므로 34번은 해결입니다.
- 덧붙임: `todos.filter(({ done }) => done)` 도 동작합니다. 할 일 하나 안에 `done` 이 있으니 이름으로 꺼낼 수 있습니다. 매개변수의 `{ }` 가 금지인 것이 아니라, 받은 것 안에 그 이름이 있어야 합니다.
- 확인 방법: 빈칸을 채운 코드와 `({ done }) => done` 을 `tsc --strict` 로 검사함 → 0건.

## 📌 10단계 정리

### 10단계에서 다룬 헷갈림의 최종 상태

번호는 [PROGRESS.md](PROGRESS.md) 「자주 틀린 점」 번호입니다.

| 번호 | 내용 | 상태 |
|---|---|---|
| 8 | `catch (e)` + `instanceof Error` | 해결 (문제 3) |
| 9 | 닫는 `}` 누락 | 문제 3 에서 누락, 문제 4 코드는 문법 통과 |
| 13 | `${ }` 는 백틱 안에서만 | **미확인** (보충 5 미제출) → 다음 복습 첫 항목 |
| 22 | `keyExtractor` 는 문자열 | 문제 3 에서 `String(...)` 정답 1회 |
| 23 | 다시 돌릴 값은 의존성 배열에 (`[retryCount]`) | 해결 (보충 4) |
| 28 | 함수 자체 넘기기 | 해결 (문제 2·3) |
| 29 | `fetch` 는 404 에서 예외 없음 | 해결 (보충 1) |
| 30 | `renderItem` 은 `{ item }` 객체를 받음 | 해결 (문제 4 보충 2) |
| 31 | 상태는 setter 로만 바뀜 | 해결 (보충 3) |
| 32 | JSX 는 하나로 감쌈 | 해결 (문제 4) |
| 33 | 계산되는 값은 상태로 두지 않음 | 해결 (문제 4 보충 1) |
| 34 | 화살표 함수 매개변수 모양 | 해결 (문제 4 2차 보충) |

### Compose / Kotlin ↔ React Native (10단계)

| Compose / Kotlin | React Native |
|---|---|
| Retrofit `Response<User>` + `isSuccessful` | `fetch` + `res.ok` |
| `LazyColumn { items(users, key = { it.id }) { user -> ... } }` | `FlatList` + `keyExtractor` + `renderItem={({ item }) => ...}` |
| `LaunchedEffect(retryCount)` | `useEffect(() => { ... }, [retryCount])` |
| Composable 안 `val visible = users.filter { it.name.contains(query) }` | 그릴 때 `const visibleUsers = users.filter((user) => user.name.includes(query))` |
| `todos.filter { todo -> todo.done }` | `todos.filter((todo) => todo.done)` |
| `"서버 오류: ${code}"` | `` `서버 오류: ${code}` `` (백틱) |

**10단계 완료!** `fetch` 로 서버 데이터를 받아 상태에 넣고 `FlatList` 로 그리기, 로딩·에러·다시 시도, 검색처럼 그릴 때 계산하는 값까지 다뤘습니다. 이것으로 1~10단계 과정이 끝났습니다. 남은 것은 백틱(13번) 확인과 [PROGRESS.md](PROGRESS.md) 「자주 틀린 점」 에서 해결로 적히지 않은 항목 복습입니다.
