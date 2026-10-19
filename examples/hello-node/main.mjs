import fs from 'node:fs';
import path from 'node:path';

export default {
  onLoad(ctx) {
    fs.writeFileSync(path.join(ctx.dataDirectory, 'loaded.txt'), 'loaded');
    ctx.logInfo(`已载入，包目录 ${ctx.packageDirectory}`);
  },

  onEnable(ctx) {
    const greeting = ctx.config('greeting');
    fs.writeFileSync(path.join(ctx.dataDirectory, 'enabled.txt'), greeting ?? '');
    ctx.logInfo(`已启用，greeting=${greeting}`);
  },

  onDisable(ctx) {
    return true;
  },

  onUnload(ctx) {},
};
