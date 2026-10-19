import fs from 'node:fs';
import path from 'node:path';

export default {
  onLoad(ctx) {
    fs.writeFileSync(path.join(ctx.dataDirectory, 'loaded.txt'), 'loaded');
    ctx.logInfo(`loaded, package ${ctx.packageDirectory}`);
  },

  onEnable(ctx) {
    const greeting = ctx.config('greeting');
    fs.writeFileSync(path.join(ctx.dataDirectory, 'enabled.txt'), greeting ?? '');
    ctx.logInfo(`enabled, greeting=${greeting}`);
  },

  onDisable(ctx) {
    return true;
  },

  onUnload(ctx) {},
};
