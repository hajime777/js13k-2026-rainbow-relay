export default {
  plugins:[{
    name:'local-compat',
    transformIndexHtml:h=>h.replace('<script src="./logic.js"></script>','<script src="./logic.js"></script><script src="./compat.js"></script>')
  }]
}
