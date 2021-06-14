import * as utils from '@blast-engine/utils'
import * as firework from '@/firework'
import * as entities from './example-entities'

utils.runScriptAndKeepAlive(async () => {
  
  const fireworkService = firework.createFireworkService({     
    instantiateRootModel: (args) => new entities.RootRef(args),  
    mock: true
  })

  await firework.applyStateActions({ 
    fireworkService,
    actions: [
        async ({ fws, root }) => {
            const sc = await fws.snap(root.serverConfigRef().query())
            await fws.update(sc.setCloudServerDisabled(false))
        }
    ] 
  })

  console.log(fireworkService.fbService.firebase.state)

})