# 학습 진행 상황

## 학습 방식

단계마다 아래 순서로 진행합니다.

1. **설명**: 개념과 코드 예시
2. **연습 문제**: 직접 풀어 볼 문제
3. **채점·피드백**: 제출한 답을 채점하고 틀린 이유를 설명
4. **보충 문제**: 틀린 부분이 있으면 그 부분만 다시 확인

정답을 바로 알려 주지 않고 직접 생각해 보게 하는 방식입니다. 제출 전에 [TypeScript Playground](https://www.typescriptlang.org/play) 에서 확인해 보는 것을 권장합니다. React Native 화면 코드는 [Expo Snack](https://snack.expo.dev) 에서 확인합니다.

**2026-11-24 부터 React Native 기준입니다** (React Native 라이브 코딩 준비). 7·8단계 강의 본문은 웹 React 로 썼고, 각 문서 맨 위 대응표로 바꿔 읽습니다. 7·8단계에서 `View`·`Text` 를 틀렸다고 본 채점은 RN 기준으로 다시 고쳤습니다.

## 단계별 상태와 채점 요약

| 단계 | 주제 | 상태 | 채점 결과 한 줄 요약 | 문서 |
|---|---|---|---|---|
| 1 | 기본 타입 | 완료 | 문제 1 정답, 문제 2는 3개 중 1개 정답, 문제 3 오답(any가 더 안전하다고 오해). 보충 1은 4개 중 3개(`const` 배열 추론 오답), 보충 2 정답 | [01](01-basic-types.md) |
| 2 | 함수 타입 | 완료 | 4문제 모두 정답 | [02](02-functions.md) |
| 3 | 객체 타입 | 완료 | 문제 1 에러 줄은 찾았으나 (다)의 이유 오답, 문제 2 정답, 문제 3 `function` 키워드 누락, 문제 4 type 쪽 `void` 누락 | [03](03-objects.md) |
| 4 | 유니온과 타입 좁히기 | 완료 | 문제 1 문자열 처리 누락, 문제 2·4 정답, 문제 3 구조는 맞으나 4곳 수정 필요(5단계에서 재도전) | [04](04-union-narrowing.md) |
| 5 | 제네릭 | 완료 | 문제 1 정답, 문제 2·3 일부 문법 실수, 문제 4(`describe` 재도전)는 4곳 중 3곳 수정, 마지막 `result.users.length` 안내 | [05](05-generics.md) |
| 6 | Promise와 async/await | 완료 | 문제 1·2·4 정답, 문제 3은 `resolve`를 부르지 않아 오답 | [06](06-async.md) |
| 7 | React + TS 기초 | 완료 | 문제 1은 (라) 이유 오답(`onClick` 누락), 문제 2·3은 props 받는 모양 오답(구조 분해 안에 타입·파라미터 여러 개), 문제 4는 `map`·`key` 정답이나 props 받는 모양·`Product` 대소문자·`}` 오타. 문제 2 의 `View`·`Text` 는 RN 기준 정답(11-24 재채점). 보충 1은 props 모양 해결·버튼 한 줄만 남음(RN 기준: `Button`→`Pressable`, `onclick`→`onPress`), 보충 2는 (가)에서 `( )` 안 변수 이름이 값으로 바뀐다고 오해 | [07](07-react-basics.md) |
| 8 | useState | 완료 | 문제 1 타입·에러 줄 정답(c 를 Kotlin 식 `User?` 로 표기, (다) 이유 보충), 문제 2 결과 오답(1 을 2 로 답함)·`prev` 수정 정답, 문제 3 상태·`View`·`Text` 정답(11-24 RN 기준 재채점)·`Buttom`/`Button` 짝 오류와 버튼은 `Pressable`+`onPress` 로 수정, 문제 4 `map` 안 조건·`key` 위치 정답이나 `setTodos[ ]`·`[...todos, map 결과]`·`{ }` 누락·`TodoItem` 미사용으로 토글 동작 안 함. 보충 1 정답(스냅샷 해결), 보충 2 문제 조건(웹 태그)·삼항 정답이나 "상태: 켜짐/꺼짐" 표시 줄 누락, 보충 3 (A) 세 번째 시도에 정답·(B) 는 문제 문장이 모호해 수량 -1 로 구현(삭제 `filter` 는 9단계 문제 4 에서 재확인)·(C) `key`·닫는 `}` 누락과 `onClidk`·`>` 누락 | [08](08-use-state.md) |
| 9 | useEffect | 완료 (11-24 RN 기준으로 다시 강의, 보충 3차까지) | 문제 1 정답(처음부터 쌓인 로그 전체로 적음, 새로 찍힌 부분 C·BC 모두 맞음), 문제 2 는 "1 에서 멈춤" 정답·두 번째 문제를 "그릴 때마다 인터벌 생성"으로 답함(실제는 사라져도 안 멈추고 나타날 때마다 하나 더)·고친 코드 없음, 문제 3 은 `[name]`·`TextInput` 연결·RN 태그 정답이나 hook 을 컴포넌트 밖에서 부름·`return { JSX }`·소문자 `draftInput`, 문제 4 ❌ — (B) `[]`·(C) `filter` 정답, (A) effect 안 바로 `await`·`catch (e: any)`, (D) `${ }`·`map` 화살표 `{ }` 블록(반환 없음)·`key` 누락·RN `Button` 에 children·`<li>`·에러 표시 누락. 보충 1 ✅ (`ChatRoom` 로그 4상황 정답, 정리 함수가 이전 값 `끊기 1` 을 찍는 것까지 맞힘), 보충 2 🔺 (effect 안 async 함수·`[userId]`·컴포넌트 틀 해결, props 타입을 `(userId:number)` 소괄호로 씀·`loading` 처음 값 `false`·다시 불러올 때 에러 안 지움·`useState<User>()` 에 `=== null`·`catch (e: any)`), 보충 3 ❌ (`key` 만 찾음, `$`·`=> { }`·RN `Button` 못 찾고 `$` 를 한 곳 더 붙임) → 2차 보충 3개(`${ }`/`{ }` 구분·`map` 반환·버튼 두 방법) → 보충 4 🔺 (가)만 `$철수` 를 `${name}` 으로 답함, 보충 5 🔺 `b` 를 `[1,2,3]` 으로 답함(실제 `undefined` 3개), 보충 6 🔺 버튼 태그 두 방법 정답·`onPress={setLikes(...)}` 바로 호출·`onclick` → 3차 보충 2개(`map` 반환·이벤트에 함수 넘기기) → 보충 7 ✅ (`=> { }` 블록 해결), 보충 8 🔺 `() => handleDelete(3)` 정답·함수 자체를 넘기는 `onPress={handleReset}` 을 못 고름 | [09](09-use-effect.md) |
| 10 | 종합 실습 | 예정 | - | - |

## 자주 틀린 점 (복습 포인트)

1. **Java 습관**: 함수 선언에 `function` 키워드 누락, 배열 길이를 `.size()` 로 씀(→ `.length`), 타입을 대문자 `String` 으로 씀(→ `string`)
2. **선언 방식 혼용**: `function` 선언과 화살표 `=>` 를 한 줄에 섞음
3. **`const` 배열·객체 추론**: 리터럴로 추론되지 않음 (`const flags = [true, false]` → `boolean[]`)
4. **초과 속성**: 객체에 없는 속성을 넣었을 때 에러가 나는 이유 혼동
5. **반환 타입**: 반환 타입을 정했는데 모든 경우에 `return` 하지 않음
6. **객체 안의 배열 길이**: `result.length` 가 아니라 `result.users.length`
7. **`new Promise`**: 안에서 `resolve` 를 부르지 않음
8. **`catch (e: any)`**: `catch {}` 또는 `catch (e)` + `instanceof Error` 로 처리 (9단계 문제 4·보충 2 에서 재발, 3회)
9. **타이핑 실수**: 따옴표 누락, 한글 키보드 `₩` 입력 등 → Playground 에서 확인한 뒤 제출. 8단계: `Buttom`, `onClidk`, 객체 안 쉼표 대신 마침표(`...item. qty`), 닫는 `}`·`>` 누락
10. **`any` 오해**: `any` 가 더 안전하다고 오해했다가 바로잡음. 에러를 미리 내 주는 `unknown` 이 더 안전
11. **props 를 파라미터 여러 개로 받음 (Compose 습관)**: React 는 props 를 객체 하나로 넘김 → `function X({ a, b }: XProps)`
12. **구조 분해 안에 타입을 적음**: `({ name: string })` 의 `:` 은 이름 바꾸기. 타입은 `}` 뒤에 `({ name }: { name: string })`. 9단계 보충 2 에서는 `}` 뒤 타입을 `(userId:number)` 처럼 소괄호로 씀 → 타입도 객체 모양 `{ userId: number }`
13. **JSX 안의 `( )` 와 `{ }`**: `{ }` 밖은 변수 이름까지 전부 글자 그대로 나옴. JSX 의 `{ }` = Kotlin 문자열 템플릿의 `${ }`. 8단계 문제 4 에서도 `todos.map(...)` 을 `{ }` 없이 씀. 9단계 문제 4 에서는 반대로 `${post.title}` 처럼 `$` 까지 붙임 → JSX 는 `{ }` 만, `$` 는 글자로 남음(RN 은 `View` 안 `$` 에서 에러). 보충 3 에서 `$` 를 한 곳 더 붙임(2회) → `${ }` 는 Kotlin 문자열·JS 백틱 문자열 **안**에서만, JSX 태그 사이는 `{ }` 만. 2차 보충 4 에서 백틱 문자열과 JSX 구분은 해결, JSX 의 `${name}` 은 `$철수` 로 나옴
14. **함수 props 도 필수**: `?` 가 없으면 `onClick` 같은 함수 props 도 꼭 넘겨야 함
15. **이벤트 이름은 camelCase**: 소문자 `onclick` 금지. React Native 는 누름 `onPress`, 입력 `onChangeText` (웹은 `onClick`·`onChange`)
16. **과정 기준 = React Native (2026-11-24 전환)**: 틀은 `View`, 글자는 **반드시** `Text` 안(밖에 두면 실행 중 에러), 누르는 영역은 `Pressable` + `onPress`, 입력창은 `TextInput` + `onChangeText`. 웹 태그(`div`·`p`·`button`·`ul`·`li`·`input`)는 RN 에 없음. RN `Button` 은 글자를 `title` 로만 받고 안에 `Text` 를 못 넣음 → 7·8단계의 `<Button onClick><Text>…</Text></Button>` 모양은 `Pressable` 로 바꾸면 정답. 숫자 조건은 `count > 0 &&` (`0 &&` 는 RN 에서 에러). RN `Button` 에 children 넣은 것 4회(7단계 보충 1·8단계 문제 3·9단계 문제 4·보충 3). RN `Button` 을 쓰려면 `<Button title="지우기" onPress={...} />`. 2차 보충 6 에서 `Pressable`·`Button title` 둘 다 정답 (해결)
17. **`User?` 는 Kotlin 표기**: TypeScript 는 `User | null`. TS 의 `?` 는 `name?: string` 처럼 속성·파라미터 이름 뒤에만 붙음
18. **상태는 이번 그리기의 스냅샷**: `count` 는 `const` 라 핸들러 안에서 고정 → `setCount(count + 1)` 을 여러 번 불러도 1 증가. 이전 값 기준이면 `setCount(prev => prev + 1)`. Compose 의 `val (count, setCount)` 모양과 같음
19. **함수 호출은 `( )`**: `setTodos[...]` 는 인덱스 접근 (Kotlin 의 `list[0]` 과 같음)
20. **`map` 결과는 이미 새 배열 전체**: `[...todos, todos.map(...)]` 처럼 다시 감싸면 배열 안에 배열이 들어감. `map` 이 돌려준 배열이 그대로 새 상태
21. **상태 객체를 직접 고침**: `item.qty++` 는 원래 객체를 바꾸고 식의 값은 숫자 → `{ ...item, qty: item.qty + 1 }` (Kotlin 의 `copy`)
22. **`map` 안 `key` 누락**: `map` 안 가장 바깥 요소에 `key={item.id}` (9단계 문제 4 에서 또 누락, `filter` 는 해결)
23. **`[]` effect 가 도는 때**: `[]` 는 화면에 나타날 때 1번만 돎(다시 그릴 때는 안 돎). "그릴 때마다"는 배열이 없을 때. 정리 함수가 없으면 사라져도 안 멈추고 다시 나타날 때마다 하나 더 생김 → `const id = setInterval(...)` + `return () => clearInterval(id)`
24. **컴포넌트 틀 3가지**: ① hook(`useState`·`useEffect`)은 파일 맨 위가 아니라 **컴포넌트 함수 안**의 맨 위 (Compose `remember` 가 `@Composable` 안에서만 되는 것과 같음) ② 여러 줄 JSX 는 `return ( ... )` — `return {` 는 객체 괄호라 문법 에러 ③ 컴포넌트 이름은 대문자(`DraftInput`)
25. **화살표 함수 `=> { }` 는 반환 없음**: `map(post => { <View/> })` 는 블록이라 `undefined` → 아무것도 안 그려짐. `=> ( <View/> )` 또는 `{ return ... }`. Kotlin 람다는 마지막 식이 저절로 반환돼서 생기는 습관 (9단계 문제 4·보충 3, 2회). 2차 보충 5 에서 `map(n => { n * 10 })` 를 `[1,2,3]` 으로 답함 → `map` 은 함수가 **돌려준 값**으로 새 배열, 안 돌려주면 `undefined` (Kotlin 의 `Unit`). 3차 보충 7 에서 해결
26. **effect 안에서 바로 `await`**: Compose `LaunchedEffect` 블록은 suspend 라 바로 부르지만 React effect 는 아님 → `const load = async () => { ... }; load();`. 데이터를 불러왔으면 에러도 화면에 그리기. 불러오기 시작할 때 `setLoading(true)`·`setError(null)` 같이 (안 지우면 이전 에러가 남음), `loading` 처음 값은 `true`
27. **`null` 과 `undefined` 는 다름**: `useState<User>()` 는 `undefined` 로 시작(`User | undefined`) → `user === null` 은 언제나 `false`. `useState<User | null>(null)` + `if (!user) return ...` 로 거르면 아래에서 `user.name` 바로 씀 (Kotlin 은 `null` 하나뿐)
28. **이벤트에 함수를 넘기지 않고 바로 부름**: `onPress={setLikes(...)}`·`onPress={handleDelete(3)}` 은 그리는 순간 실행(상태를 바꾸면 "Too many re-renders"). 값을 넘길 때는 `onPress={() => handleDelete(3)}`, 없으면 `onPress={handleReset}`. Compose `onClick = { ... }` 람다 = React `() => ...` (7단계 `onClick={onDelete(id)}` 함정, 9단계 2차 보충 6 에서 재발). 3차 보충 8 에서 감싸기(`() => handleDelete(3)`)는 맞혔으나 함수 자체 넘기기(`onPress={handleReset}`)를 못 고름 → 10단계에서 재확인

## 다음에 할 일

- **10단계 종합 실습 시작** (React Native): 실제 API 호출(`fetch`) → 상태 저장 → `FlatList` 로 화면 표시, 로딩·에러·삭제까지. 강의부터 진행
- 10단계에서 재확인할 것: 이벤트에 함수 자체 넘기기(28번), `map` 반환(25번), `key`(22번), `catch (e)`(8번), `null`·`undefined`(27번)

이어서 진행할 때 Claude Code 에 줄 요청:

> `BasicStudy/docs/PROGRESS.md 를 읽고, 학습 모드로 10단계 종합 실습(React Native)을 강의부터 시작해 줘. 문제를 내고 내 답을 채점한 뒤 보충 문제까지 진행하는 방식으로.`
