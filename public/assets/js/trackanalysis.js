// Event listeners for the track analysis

$(document).ready(function() {

    $('.track-img').on('click', function() {
        $('#analysis' + $(this).attr('track-id')).toggle(300);
    });

    $('#show-analysis').on('click', function() {
        $('.track-analysis-box').show(300);
    });

    $('#close-analysis').on('click', function() {
        $('.track-analysis-box').hide(300);
    });

});
