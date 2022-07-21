export default (name: string) => `import { Div } from 'honorable'

function ${name}(props: any) {
  return (
    <Div {...props}>
      A div component
    </Div>
  )
}

export default ${name}`