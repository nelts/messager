# @nelts/context

context for nelts

# Usage

```bash
npm i @nelts/context
```

by ts:

```ts
import Context from '@nelts/context';
type BodyType = { [name: string]: any };
type FileType = { [name: string]: any };
const ctx = new Context<APP, BodyType, FileType>(app, req, res, {
  cookie, params, logger,
});
```

# License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present, yunjie (Evio) shen
