$(document).ready(function() {

    // $('.track-analysis-box').hide();
    // $('.track-analysis-box').show(); // only added for testing purposes, remove this!!

    var trackID;

    $('.track-img').hover(
        function() {
            $('#analysis' + $(this).attr('track-id')).show(300);
        },
        function() {
            $('#analysis' + $(this).attr('track-id')).hide(300);
        });

    // $('.track_img').on('click', function() {
    //     $('#analysis' + $(this).attr('track-id')).toggle(500);
    // });

});
