$(document).ready(function() {

    $('.track-img').hover(
            function() {
                $('#analysis' + $(this).attr('track-id')).show(300);
            },
            function() {
                $('#analysis' + $(this).attr('track-id')).hide(300);
            });

    $('.track-row').on('click', function() {
        $('#analysis' + $(this).attr('track-row-id')).toggle(300);
    });

    $('#show-analysis').on('click', function() {
        $('.track-analysis-box').show(300);
    });

    $('#close-analysis').on('click', function() {
        $('.track-analysis-box').hide(300);
    });

});
