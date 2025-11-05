const subtitleFile = document.getElementById("subtitleFile");
const convertBtn = document.getElementById("convertBtn");
const formatSelect = document.getElementById("formatSelect");
const preview = document.getElementById("preview");
const downloadLink = document.getElementById("downloadLink");

convertBtn.addEventListener("click", () => {
    const file = subtitleFile.files[0];
    if (!file) {
        alert("请先选择一个字幕文件！");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        let content = e.target.result;
        const targetFormat = formatSelect.value;

        let converted = convertSubtitle(content, targetFormat);

        preview.value = converted;

        const blob = new Blob([converted], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = file.name.replace(/\.[^/.]+$/, "") + "." + targetFormat;
        downloadLink.style.display = "block";
        downloadLink.textContent = "下载转换后的字幕";
    };
    reader.readAsText(file, "utf-8");
});

function convertSubtitle(content, format) {
    // 简单示例：只处理 SRT <-> VTT
    if (format === "vtt") {
        content = "WEBVTT\n\n" + content.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
    } else if (format === "srt") {
        content = content.replace(/^WEBVTT\s*\n/, "").replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})/g, "$1,$2");
    } 
    // ASS 可以再扩展
    return content;
}
