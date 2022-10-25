import { useState } from 'react'
import { Div } from 'ecu-client'

function DivWithInput(props: any) {
  const [name, setName] = useState('Cool')

  return (
    <Div data-ecu="CaeHyMveYM:0">
      <Div data-ecu="CaeHyMveYM:0_0">
        Edit me I'm famous
      </Div>
      <input
        value={name}
        onChange={event => setName(event.target.value)}
        data-ecu="CaeHyMveYM:0_1"
      />
    </Div>
  )
}
export default DivWithInput
