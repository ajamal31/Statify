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

});
