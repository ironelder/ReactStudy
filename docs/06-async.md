# 6단계: Promise와 async/await

### 6-1. 비동기란?

서버에서 데이터를 받는 것처럼 **시간이 걸리는 작업**은 기다리지 않고 다음 코드로 넘어갑니다.

```ts
console.log("1. 주문");
setTimeout(() => console.log("2. 커피 나옴"), 1000);  // 1초 뒤 실행 예약
console.log("3. 자리에 앉음");

// 출력 순서: 1. 주문 → 3. 자리에 앉음 → (1초 뒤) 2. 커피 나옴
```

카페 진동벨과 같습니다. 주문하고 벨을 받아서 자리에 앉아 있으면, 커피가 나왔을 때 벨이 울립니다.

### 6-2. Promise: "나중에 값을 줄게"라는 약속

**Promise가 바로 그 진동벨입니다.** 지금은 값이 없지만 나중에 **성공(resolve)** 또는 **실패(reject)**로 결과를 알려 줍니다.

```ts
//                  ↓ 성공하면 string을 줄 약속 (5단계 제네릭!)
const order = new Promise<string>((resolve, reject) => {
  setTimeout(() => {
    const ok = true;
    if (ok) resolve("아메리카노");          // 성공 → 값 전달
    else reject(new Error("재료 소진"));    // 실패 → 에러 전달
  }, 1000);
});

order
  .then(coffee => console.log(coffee))      // coffee: string ← Promise<string>에서 옴
  .catch(err => console.log("실패:", err));
```

`Promise<T>`의 `T`는 **성공했을 때 받을 값의 타입**입니다.

### 6-3. async/await: Promise를 편하게 쓰는 방법 ⭐

`.then()`을 이어 붙이면 길어지기 때문에, 실무에서는 대부분 `async/await`를 씁니다.

```ts
async function getCoffee() {
  const coffee = await order;   // await: 결과가 나올 때까지 여기서 기다림
  console.log(coffee);          // coffee: string ← Promise<string>의 "알맹이"
}
```

두 가지 규칙만 기억하세요.

| 규칙 | 예시 |
|---|---|
| **`await`는 Promise의 포장을 벗긴다** | `Promise<string>` → `await` → `string` |
| **`async` 함수는 항상 Promise를 반환한다** | `return 10` 해도 반환 타입은 `Promise<number>` |

```ts
async function getNumber() {
  return 10;
}
const a = getNumber();         // a: Promise<number>  ← await 없이 부르면 진동벨
const b = await getNumber();   // b: number           ← await 하면 알맹이
```

### 6-4. 에러 처리: try/catch

```ts
async function getCoffee() {
  try {
    const coffee = await order;
    console.log(coffee);
  } catch (e) {
    // e의 타입은 unknown! (무엇이 던져졌는지 알 수 없으니까)
    if (e instanceof Error) {
      console.log(e.message);   // ✅ Error로 좁혀졌으니 message 사용 가능
    }
  } finally {
    console.log("주문 종료");   // 성공이든 실패든 항상 실행
  }
}
```

1단계에서 배운 **`unknown` → 확인 → 사용** 패턴이 여기서 실제로 나옵니다. `instanceof`는 `typeof`처럼 타입을 좁히는데, 객체가 어떤 클래스(`Error`)로 만들어졌는지 확인합니다.

### 6-5. 실전: 서버에서 데이터 받기

8~10단계에서 `useEffect` 안에 넣게 될 바로 그 코드입니다.

```ts
type User = { id: number; name: string };

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!res.ok) {
    throw new Error(`요청 실패: ${res.status}`);   // 실패면 에러를 던짐 → catch로 감
  }
  return res.json();   // 받은 JSON을 User로 반환
}
```

> ⚠️ `res.json()`은 서버가 실제로 무엇을 보냈는지 모르기 때문에 `any`를 돌려줍니다. 반환 타입을 `Promise<User>`로 적어 "User가 온다고 믿는다"는 뜻을 밝히는 겁니다. TypeScript는 **실행 중에 들어온 데이터까지 검사하지는 않습니다.**

### 6-6. 여러 개를 동시에: `Promise.all`

```ts
// 하나씩: 1초 + 1초 = 2초
const u1 = await fetchUser(1);
const u2 = await fetchUser(2);

// 동시에: 약 1초
const [a, b] = await Promise.all([fetchUser(1), fetchUser(2)]);   // a, b: User
```

## 🧪 6단계 연습 문제

**문제 1.** 각 변수의 타입을 맞혀 보세요.
```ts
async function getName() {
  return "철수";
}

const x = getName();
const y = await getName();
```

**문제 2.** 아래 코드의 출력 순서를 맞혀 보세요.
```ts
console.log("A");
setTimeout(() => console.log("B"), 1000);
console.log("C");
```

**문제 3.** `ms` 밀리초만큼 기다리는 함수 `wait`를 완성해 주세요. 성공할 때 돌려줄 값은 없습니다.
```ts
function wait(ms: number): Promise<void> {
  return new Promise(/* 여기를 채워 주세요 */);
}

// 사용 예: await wait(1000);  → 1초 기다림
```
> 💡 힌트: 6-2의 `new Promise((resolve, reject) => { ... })` 모양에서 `setTimeout`과 `resolve`만 쓰면 됩니다. 실패할 일이 없으니 `reject`는 빼도 됩니다.

**문제 4.** 6-5의 `fetchUser`를 사용해서, 성공하면 사용자 이름을, 실패하면 `"불러오기 실패"`를 반환하는 함수를 작성해 주세요.
```ts
async function getUserName(id: number): Promise<string> {
  // 여기를 채워 주세요 (try/catch 사용)
}
```

## ✍️ 내 답

```text
1. x : Promise<string> , y : string

2. A C B

3. new Promise((reso9lve, reject) => {setTimeout(()=> {},ms)});

4. async function getUserName(id: number): Promise<string> {
  try {
    const user = await fetchUser(id);
    return user.name;
  } catch (e:any){
    return "불러오기 실패"; 
  }
}
```

## ✅ 채점·피드백 (정답 포함)

### 문제 1 ✅ 정답

`x: Promise<string>`(await 없이 부르면 진동벨), `y: string`(await 하면 알맹이). 6단계의 핵심 규칙 두 개를 정확히 이해하셨습니다.

### 문제 2 ✅ 정답

`A → C → B`. 기다리지 않고 다음 줄로 넘어간다는 비동기 개념이 잡혔습니다.

### 문제 3 ❌ `resolve`를 부르지 않아서 영원히 기다림

```ts
new Promise((reso9lve, reject) => { setTimeout(() => {}, ms) });
//                                              ↑ 1초 뒤 아무것도 안 함
```

`reso9lve` 오타보다 더 중요한 문제가 있습니다. **`setTimeout` 안에서 `resolve`를 부르지 않았습니다.** Promise는 `resolve`가 불려야 "끝났다"고 알립니다. 진동벨이 절대 울리지 않으니 `await wait(1000)`은 **영원히 다음 줄로 넘어가지 않습니다.** 에러도 나지 않아서 찾기 어려운 버그입니다.

```ts
// ✅ 정답
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);   // ms 뒤에 "끝났어!" 알림
  });
}

// ✅ 줄인 버전 (실무에서 자주 보는 형태)
const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
```

> 📌 **Promise를 직접 만들 때는 반드시 `resolve` 또는 `reject` 중 하나가 불려야 합니다.**

### 문제 4 ✅ 정답 (작은 개선점 하나)

`await`로 알맹이를 꺼내고, `try/catch`로 실패를 처리하고, 둘 다 string을 반환하는 구조가 완벽합니다. 👏

개선점은 `catch (e: any)`입니다. 1단계에서 배운 대로 `any`는 검사를 꺼 버립니다. 이번처럼 `e`를 쓰지 않으면 **아예 빼는 게** 가장 깔끔합니다.

```ts
} catch {                    // ✅ e를 안 쓸 때
  return "불러오기 실패";
}

} catch (e) {                // ✅ e를 쓸 때: 타입을 안 적으면 unknown
  if (e instanceof Error) console.log(e.message);
  return "불러오기 실패";
}
```

**6단계 완료!** 🎉 TypeScript 문법은 여기까지입니다. 이제 React로 넘어갑니다.
