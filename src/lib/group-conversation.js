// https://api.slack.com/types/conversation#the_conversational_booleans
export default {
  public: ({ is_channel, is_private, is_group }) =>
    is_channel && (!is_private && !is_group),
  // I've seen channels that should be is_group (indicating a private channel)
  // but are not so private channels are grouped by is_private and not any sort of DM
  private: ({ is_private, is_group, is_mpim, is_im }) =>
    (is_private || is_group) && !is_im && !is_mpim,
  im: ({ is_im }) => is_im,
  mpim: ({ is_mpim }) => is_mpim
}
