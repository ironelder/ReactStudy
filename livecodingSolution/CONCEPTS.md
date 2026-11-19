# 핵심 개념 빠른 참고

## 객체·배열 전개

`{ ...state, value: next }`는 기존 객체를 얕게 복사하고 뒤에 적은 키 값으로 덮어씁니다. 예를 들어 `{ ...{a: 1}, a: 2 }`는 `{a: 2}`입니다. 배열은 `[...first, ...second]`처럼 이어 붙일 수 있습니다. 전개는 얕은 복사이므로 중첩 객체는 자동 복사되지 않습니다. `counts`를 바꿀 때는 `{ ...state, counts: { ...state.counts, [id]: next } }`처럼 바깥 state와 안쪽 맵을 각각 복사합니다. Kotlin에서는 `map + (id to value)`와 비교할 수 있지만 구현과 변경 가능성은 다릅니다.

## Promise와 비동기 함수

Promise는 나중에 성공값 또는 실패가 정해지는 객체입니다. 처음에는 pending이고, 이후 fulfilled 또는 rejected 중 하나로 끝나며 한 번 정해지면 바뀌지 않습니다. `async` 함수 호출은 첫 `await` 전까지 동기적으로 실행하고 Promise를 반환합니다. `await`는 해당 결과를 기다립니다. `Promise.all`은 이미 시작한 여러 Promise의 결과를 함께 기다립니다.

```ts
console.log("A");
async function run() {
  console.log("B");
  await Promise.resolve();
  console.log("D");
}
run();
console.log("C");
// 출력: A, B, C, D
```

함수 호출은 `await` 전까지 즉시 실행하고, `await` 뒤는 Promise가 완료된 뒤 이어집니다. Kotlin의 `Deferred`와 `await()`는 비동기 결과를 기다린다는 점에서 비유할 수 있지만, Promise는 자동 취소되지 않으며 Kotlin coroutine의 취소 전파·구조적 동시성과 다릅니다. Promise 자체에는 일반적인 취소 기능이 없고, `void promise`는 반환값을 버릴 뿐 실패를 잡지 않습니다. `AbortController`도 연결된 API가 신호를 지원해야 취소 효과가 있습니다.

## this와 콜백

일반 메서드를 분리해 전달하면 호출 문맥에 따라 `this`가 사라질 수 있습니다. 화살표 함수 필드나 명시적 바인딩으로 인스턴스를 보존합니다. 예: `onMessage: (delta) => this.onMessage(delta)`.

## React 외부 store

`useSyncExternalStore`의 `getSnapshot`은 상태가 그대로면 같은 객체 참조를 반환하고, 상태 변경 시 새 스냅샷 객체를 반환해야 합니다. 구독 함수는 해제 함수를 돌려줍니다. 화면은 외부 store 값을 복제하지 말고 구독해 렌더링합니다.
