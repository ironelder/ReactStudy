# 학습 진행 상황

## 학습 방식

단계마다 아래 순서로 진행합니다.

1. **설명**: 개념과 코드 예시
2. **연습 문제**: 직접 풀어 볼 문제
3. **채점·피드백**: 제출한 답을 채점하고 틀린 이유를 설명
4. **보충 문제**: 틀린 부분이 있으면 그 부분만 다시 확인

정답을 바로 알려 주지 않고 직접 생각해 보게 하는 방식입니다. 제출 전에 [TypeScript Playground](https://www.typescriptlang.org/play) 에서 확인해 보는 것을 권장합니다.

## 단계별 상태와 채점 요약

| 단계 | 주제 | 상태 | 채점 결과 한 줄 요약 | 문서 |
|---|---|---|---|---|
| 1 | 기본 타입 | 완료 | 문제 1 정답, 문제 2는 3개 중 1개 정답, 문제 3 오답(any가 더 안전하다고 오해). 보충 1은 4개 중 3개(`const` 배열 추론 오답), 보충 2 정답 | [01](01-basic-types.md) |
| 2 | 함수 타입 | 완료 | 4문제 모두 정답 | [02](02-functions.md) |
| 3 | 객체 타입 | 완료 | 문제 1 에러 줄은 찾았으나 (다)의 이유 오답, 문제 2 정답, 문제 3 `function` 키워드 누락, 문제 4 type 쪽 `void` 누락 | [03](03-objects.md) |
| 4 | 유니온과 타입 좁히기 | 완료 | 문제 1 문자열 처리 누락, 문제 2·4 정답, 문제 3 구조는 맞으나 4곳 수정 필요(5단계에서 재도전) | [04](04-union-narrowing.md) |
| 5 | 제네릭 | 완료 | 문제 1 정답, 문제 2·3 일부 문법 실수, 문제 4(`describe` 재도전)는 4곳 중 3곳 수정, 마지막 `result.users.length` 안내 | [05](05-generics.md) |
| 6 | Promise와 async/await | 완료 | 문제 1·2·4 정답, 문제 3은 `resolve`를 부르지 않아 오답 | [06](06-async.md) |
| 7 | React + TS 기초 | 강의·문제 출제, 답 아직 안 냄 | - | [07](07-react-basics.md) |
| 8 | useState | 예정 | - | - |
| 9 | useEffect | 예정 | - | - |
| 10 | 종합 실습 | 예정 | - | - |

## 자주 틀린 점 (복습 포인트)

1. **Java 습관**: 함수 선언에 `function` 키워드 누락, 배열 길이를 `.size()` 로 씀(→ `.length`)
2. **선언 방식 혼용**: `function` 선언과 화살표 `=>` 를 한 줄에 섞음
3. **`const` 배열·객체 추론**: 리터럴로 추론되지 않음 (`const flags = [true, false]` → `boolean[]`)
4. **초과 속성**: 객체에 없는 속성을 넣었을 때 에러가 나는 이유 혼동
5. **반환 타입**: 반환 타입을 정했는데 모든 경우에 `return` 하지 않음
6. **객체 안의 배열 길이**: `result.length` 가 아니라 `result.users.length`
7. **`new Promise`**: 안에서 `resolve` 를 부르지 않음
8. **`catch (e: any)`**: `catch {}` 또는 `catch (e)` + `instanceof Error` 로 처리
9. **타이핑 실수**: 따옴표 누락, 한글 키보드 `₩` 입력 등 → Playground 에서 확인한 뒤 제출
10. **`any` 오해**: `any` 가 더 안전하다고 오해했다가 바로잡음. 에러를 미리 내 주는 `unknown` 이 더 안전

## 다음에 할 일

- **7단계 연습 문제 4개 풀기** ([07-react-basics.md](07-react-basics.md)): props 타입, 선택 props, 함수 props(`TodoItem`), `map` + `key`(`ProductList`)
- 이후 8단계 `useState` → 9단계 `useEffect` → 10단계 종합 실습

이어서 진행할 때 Claude Code 에 줄 요청:

> `docs/PROGRESS.md 와 docs/07-react-basics.md 를 읽고, 학습 모드로 7단계 연습 문제부터 이어서 진행해 줘. 문제를 내고 내 답을 채점한 뒤 다음 단계로 넘어가는 방식으로.`
