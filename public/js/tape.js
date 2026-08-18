function buildTapes() {
  document.querySelectorAll('.tape .ticks').forEach(function (el) {
    var count = 60;
    var html = '';
    for (var i = 0; i < count; i++) {
      var major = i % 5 === 0;
      html += '<div class="tick' + (major ? ' major' : '') + '">' + (major ? '<span>' + i + '</span>' : '') + '</div>';
    }
    el.innerHTML = html;
  });
}

document.addEventListener('sections:loaded', buildTapes);
