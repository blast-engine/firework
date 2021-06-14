
// @warning: mutates fireworkService
export const applyStateActions = async ({ fireworkService, actions = [] }) => {
  if (!fireworkService) throw new Error('fireworkService not provided')
  let i = 0
  while (i < actions.length) 
    await actions[i++]({ fireworkService, fws: fireworkService, root: fireworkService.root })
  return fireworkService
}

/* example ---

await applyStateActions({ 
    fireworkService,
    actions: [
        async ({ fws }) => {
            const sc = await fws.snap(rootRef.serverConfigRef().query())
            await fws.update(sc.setCloudServerDisabled(false))
        }
    ] 
})

*/
