import { bootstrap, startExpress } from './server'

export const PORT = process.dotEnv.PORT

bootstrap(startExpress).then(app => app.listen(PORT, () => console.log('Started on port: ' + PORT)))
