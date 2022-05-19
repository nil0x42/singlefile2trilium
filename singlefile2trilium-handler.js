// HowTo:
//  1- Add this file to trilium as a `JS Backend` code note.
//  2- Set label `customRequestHandler` to 'singlefile2trilium'.

const preamble = `

<iframe id="__trilium_iframe" style="width:100%; border:none;" srcdoc="`;

const postamble = `
">iframe not loaded properly?</iframe>

<script>
    const iframe = document.getElementById("__trilium_iframe");
    function pageY(elem) {
        return elem.offsetParent ? (elem.offsetTop + pageY(elem.offsetParent)) : elem.offsetTop;
    }
    
    function resizeIframe() {
        var height = document.documentElement.clientHeight;
        height -= pageY(iframe) + 20 ;
        height = (height < 0) ? 0 : height;
        if (!iframe) return;
        iframe.style.height = height + 'px';
    }
    
    iframe.addEventListener('load', resizeIframe);
    window.addEventListener('resize', resizeIframe);
</script>
`;

const {req, res} = api;
const {title, url, content} = req.body;

if (req.method == 'POST') {
    const todayNote = api.getTodayNote();
    
    const renderNote = (api.createNewNote({
        parentNoteId: todayNote.noteId,
        title: title,
        content: '',
        type: 'render'
    })).note;
    renderNote.setLabel('clipType', 'singlefile2trilium');
    renderNote.setLabel('pageUrl', url);
    renderNote.setLabel('pageTitle', title);
    
    const encodedContent = content.replaceAll('"', '"');
    const wrapped_content = preamble + encodedContent + postamble;
    const htmlNote = (api.createNewNote({
        parentNoteId: renderNote.noteId,
        title: 'content.html',
        content: wrapped_content,
        type: 'code',
        mime: 'text/html'
    })).note;
    htmlNote.setLabel('archived');

    renderNote.setRelation('renderNote', htmlNote.noteId);

    res.send(201); // http 201: created
}
else {
    res.send(400); // http 400: bad request
}
